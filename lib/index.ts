#!/usr/bin/env node
import commander from 'commander'
import fs from 'fs'
import { Convert } from './converter'

commander.program.version('0.0.10', '-v, --version', 'output the current version')
commander.program
  .requiredOption('-s, --source <files_or_dirs...>', 'specify the input markdown files or directories')
  .addOption(new commander.Option('-d, --destination <path>', 'specify the output directory').default('./output', './output'))
  .addOption(new commander.Option('-l, --layout <html_file>', 'specify the layout file').default('', '""'))
  .addOption(new commander.Option('-b, --hardBreak', 'use hard break instead of soft break'))
  .parse(process.argv)

const options = commander.program.opts()

const dest: string = options.destination === '' ? './output' : options.destination
const layout: string | null = options.layout !== '' ? fs.readFileSync(options.layout, { encoding: 'utf-8' }) : null
const hardBreak: boolean = options.hardBreak

const converter = new Convert(layout, hardBreak)

converter.convertFiles(options.source, dest)
