#!/usr/bin/env node
import commander from 'commander'
import fs from 'fs'
import { Converter } from './converter'
import path from 'path'
import * as https from 'https'
import * as http from 'http'
import { glob } from 'glob'
import { createHash } from 'node:crypto'

const hash = createHash('sha256');

commander.program.version('1.1.0', '-v, --version', 'output the current version')
commander.program
    .requiredOption('-i, --input <files_or_urls...>', 'the path/url of input markdown files')
    .addOption(new commander.Option('-d, --dest <dir>', 'the path of output directory (filename is generated automatically)').default('', './output'))
    .addOption(new commander.Option('-o, --output <files...>', 'the path of output file (ignored if the flag -d is set)').default('', '""'))
    .addOption(new commander.Option('-l, --layout <html_file>', 'specify the layout file').default('', '""'))
    .addOption(new commander.Option('-b, --hardBreak', 'use hard break instead of soft break'))
    .addOption(new commander.Option('-k, --dark', 'use the dark mode layout (only activate it when the -l option is not set)'))
    .parse(process.argv)

const options = commander.program.opts()
const inputs: fs.PathLike[] = options.input
const dest: fs.PathLike = options.dest === '' ? './output' : options.dest
const outputs: fs.PathLike[] | null = options.dest === '' && options.output !== '' ? options.output : null
const layout: fs.PathLike | null = options.layout !== '' ? fs.readFileSync(options.layout, { encoding: 'utf-8' }) : null
const hardBreak: boolean = options.hardBreak
const darkMode: boolean = options.dark

function main() {
    const converter = new Converter(layout, hardBreak, darkMode)
    let errorCounter = 0
    let outputsIndex = 0
    const outputFilenameSet = new Set<string>()

    const isURL = (s: string): URL | null => {
        try {
            const url = new URL(s);
            return url
        } catch (err) {
            return null
        }
    }

    const printError = (fn: string | fs.PathLike, e: any) => {
        console.error(`❌ #${errorCounter} ${fn}`)
        console.error(`${e}`)
        errorCounter++
    }

    const convertURL = (inputURL: URL, output: fs.PathLike, res: http.IncomingMessage) => {
        let data = ""
        res.on('data', (d) => {
            data += d
        })
        res.on('end', () => {
            const converted = converter.convert(data)
            try {
                fs.writeFileSync(output, converted)
                console.log(`✅ ${inputURL} ➡️  ${output}`)
            } catch (e) {
                printError(inputURL, e)
                return
            }
        })
    }

    const generateOutputFilename = (inputFilename: fs.PathLike): string => {
        // if `outputs` is non-null, use `outputs` as output file name
        let ret: string
        if (outputs !== null) {
            if (outputsIndex < outputs.length) {
                ret = outputs![outputsIndex]!.toString()
                outputsIndex++
            } else {
                throw ('the number of --output is smaller than the number of --input');
            }
        } else {
            ret = path.join(dest.toString(), path.basename(inputFilename.toString()).replace(/\.md$/, '') + '.html')
        }
        // if `ret` is repeated, use a hash function to generate a new filename
        let hashIn: string = inputFilename.toString()
        const retExtname = path.extname(ret) // including leading dot '.'
        const tmpRet = ret.replace(new RegExp(retExtname + "$"), '')
        while (outputFilenameSet.has(ret)) {
            hashIn = hash.update(hashIn).digest('hex').toString().substring(0, 5)
            ret = tmpRet + '.' + hashIn + retExtname
        }
        outputFilenameSet.add(ret)
        return ret
    }

    // if `outputs` is null, generate the output file in the directory `dest`
    // if `dest` existed, check `dest` is directory
    // otherwise create the new directory `dest`
    if (outputs === null) {
        if (fs.existsSync(dest)) {
            const stats = fs.statSync(dest)
            if (!stats.isDirectory()) {
                printError(dest, `${dest} is not directory`)
                return
            }
        }

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }
    }

    inputs.forEach((fn: fs.PathLike) => {
        // 1. http/https mode
        const url = isURL(fn.toString())
        if (url != null) {
            if (outputs !== null && outputsIndex >= outputs?.length) {
                return
            }
            if (url.protocol === 'https:') {
                https.get(url, (res) => {
                    convertURL(url, generateOutputFilename(url), res)
                }).on('error', (e) => {
                    printError(fn, e)
                })
            } else if (url.protocol === 'http:') {
                http.get(url, (res) => {
                    convertURL(url, generateOutputFilename(url), res)
                }).on('error', (e) => {
                    printError(fn, e)
                })
            } else {
                printError(url, "protocol not supported")
            }
        } else {
            // 2. File mode
            glob(fn.toString()).then((fileList: string[]) => {
                fileList.forEach((f) => {
                    try {
                        const stats = fs.statSync(f)
                        if (stats.isDirectory()) {
                            return
                        }
                    } catch (e) {
                        printError(fn, e)
                        return
                    }
                    const markdown = fs.readFileSync(f, { encoding: 'utf-8' })
                    const converted = converter.convert(markdown)
                    const o = generateOutputFilename(f)
                    try {
                        fs.writeFileSync(o, converted)
                        console.log(`✅ ${f} ➡️  ${o}`)
                    } catch (e) {
                        printError(f, e)
                    }
                })
            }).catch((e) => {
                printError(fn, e)
            })
        }
    })
}

main()