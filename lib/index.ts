#!/usr/bin/env node
import commander from 'commander';

commander.program.version('0.0.3', '-v, --version', 'output the current version');
commander.program
    .requiredOption('-s, --source <files_or_dirs...>', 'specify the input markdown files or directories')
    .addOption(new commander.Option('-d, --destination <path>', 'specify the output directory').default('./output', './output'))
    .addOption(new commander.Option('-l, --layout <html_file>', 'specify the layout file').default('', '""'))
    .parse(process.argv);

const options = commander.program.opts();


import path from 'path';
import {Convert} from './converter';

let dest = options.destination == '' ? './output' : options.destination;
let layout = options.layout == '' ? path.join(__dirname, '../layout.html') : options.layout;

new Convert(options.source, dest, layout).convertBatch();
