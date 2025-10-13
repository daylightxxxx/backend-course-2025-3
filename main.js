const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
    .requiredOption('-i, --input <path>', 'Input JSON file path')
    .option('-o, --output <path>', 'Output file path')
    .option('-d, --display', 'Display result in console')
    .option('-m, --mfo', 'Display MFO code before bank name')
    .option('-n, --normal', 'Display only banks with COD_STATE = 1');

program.parse(process.argv);
const options = program.opts();

// --- Перевірка файлу ---
const inputPath = path.resolve(options.input);

if (!fs.existsSync(inputPath)) {
    console.error('Cannot find input file');
    process.exit(1);
}

// --- Читання JSON ---
let rawData;
try {
    rawData = fs.readFileSync(inputPath, 'utf8');
} catch (err) {
    console.error('Error reading file:', err.message);
    process.exit(1);
}

let data;
try {
    data = JSON.parse(rawData);
} catch (err) {
    console.error('Invalid JSON:', err.message);
    process.exit(1);
}

// --- Фільтрація ---
let result = data;
if (options.normal) {
    result = result.filter(item => item.COD_STATE === 1);
}

// --- Формування вихідних рядків ---
const outputLines = result.map(item => {
    const name = item.FULLNAME || item.name || 'Unknown';
    const mfo = item.MFO || item.mfo || '';
    return options.mfo ? `${mfo} ${name}` : name;
});

// --- Якщо не задано жодного вихідного параметра ---
if (!options.output && !options.display) {
    process.exit(0);
}

// --- Запис у файл ---
if (options.output) {
    const outputPath = path.resolve(options.output);
    try {
        fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf8');
        console.log(`Output written to ${outputPath}`);
    } catch (err) {
        console.error('Error writing file:', err.message);
    }
}

// --- Вивід у консоль ---
if (options.display) {
    console.log(outputLines.join('\n'));
}
