import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
    .requiredOption('-i, --input <path>', 'Input JSON file path')
    .option('-o, --output <path>', 'Output file path')
    .option('-d, --display', 'Display result in console')
    .option('-m, --mfo', 'Display MFO code before bank name')
    .option('-n, --normal', 'Display only banks with COD_STATE = 1');

program.parse(process.argv);

const options = program.opts();

// --- Перевірки ---
if (!options.input) {
    console.error('Please, specify input file');
    process.exit(1);
}

if (!fs.existsSync(options.input)) {
    console.error('Cannot find input file');
    process.exit(1);
}

// --- Читання JSON ---
const data = JSON.parse(fs.readFileSync(options.input, 'utf8'));

// --- Обробка даних ---
let result = data;

if (options.normal) {
    result = result.filter(item => item.COD_STATE === 1);
}

let output = result.map(item => {
    const name = item.FULLNAME || item.name || 'Unknown';
    const mfo = item.MFO || item.mfo || '';
    return options.mfo ? `${mfo} ${name}` : name;
}).join('\n');

// --- Вивід/запис ---
if (options.output) {
    fs.writeFileSync(options.output, output);
}

if (options.display) {
    console.log(output);
}
