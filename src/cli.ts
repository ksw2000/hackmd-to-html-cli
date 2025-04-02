#!/usr/bin/env node
import commander from 'commander'
import fs from 'fs'
import { ConvertedResult, Converter } from './converter'
import path from 'path'
import * as https from 'https'
import * as http from 'http'
import { glob } from 'glob'
import { createHash } from 'node:crypto'
import { escapeHtml, reverseEscapeHtml} from './markdown/utils'
import { version } from '../package.json';

const hash = createHash('sha256');

commander.program.version(version, '-v, --version', 'output the current version')
commander.program
    .requiredOption('-i, --input <files_or_urls...>', 'the path/url of input markdown files')
    .addOption(new commander.Option('-d, --dest <dir>', 'the path of output directory (filename is generated automatically)').default('', './output'))
    .addOption(new commander.Option('-o, --output <files...>', 'the path of output file (ignored if the flag -d is set)').default('', '""'))
    .addOption(new commander.Option('-l, --layout <html_file>', 'specify the layout file').default('', '""'))
    .addOption(new commander.Option('-b, --hardBreak', 'use hard break instead of soft break'))
    .addOption(new commander.Option('-k, --dark', 'use the dark mode layout (activate only if the -l option is not set)'))
    .addOption(new commander.Option('-m, --hmd', 'the input markdown url is from hackmd'))
    .parse(process.argv)

const options = commander.program.opts()
const inputs: fs.PathLike[] = options.input
const dest: fs.PathLike = options.dest === '' ? './output' : options.dest
const outputs: fs.PathLike[] | null = options.dest === '' && options.output !== '' ? options.output : null
const inputLayout: string | null = options.layout !== '' ? fs.readFileSync(options.layout, { encoding: 'utf-8' }) : null
const hardBreak: boolean = options.hardBreak
const darkMode: boolean = options.dark

function main() {
    const converter = new Converter({
        html: true,
        breaks: !hardBreak,
        linkify: true,
        typographer: true
    })

    let errorCounter = 0
    let outputsIndex = 0
    const outputFilenameSet = new Set<string>()

    // load layout
    const layout: string = inputLayout ?? defaultLayout(darkMode);

    const isHackmd: boolean = options.hmd

    const isURL = (s: string): URL | null => {
        try {
            const url = new URL(s);
            return url
        } catch {
            return null
        }
    }

    const extractHackmdContent = (data: string) => {
        if (isHackmd) {
            // Extract content from div#publish-page
            const matchResult = data.match(
                /<div id="publish-page">([\s\S]*?)<\/div>/
            );
            const publishPageContent = matchResult
                ? reverseEscapeHtml(matchResult[0])
                : "";
            return publishPageContent;
        }
        return data;
    }

    const printError = (fn: string | fs.PathLike, e: unknown) => {
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
            const publishPageContent = extractHackmdContent(data)
            const res = converter.render(publishPageContent)
            const converted = renderToLayout(res, layout)
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
                    const res = converter.render(markdown)
                    const converted = renderToLayout(res, layout);
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

function renderToLayout(res: ConvertedResult, layout: string): string {
    let metas = ''
    if (res.metadata.title !== '') {
        metas += '<title>' + escapeHtml(res.metadata.title) + '</title>\n'
        metas += '<meta name="twitter:title" content="' + escapeHtml(res.metadata.title) + '" />\n'
        metas += '<meta property="og:title" content="' + escapeHtml(res.metadata.title) + '" />\n'
    }
    if (res.metadata.robots !== '') {
        metas += '<meta name="robots" content="' + escapeHtml(res.metadata.robots) + '">\n'
    }
    if (res.metadata.description !== '') {
        metas += '<meta name="description" content="' + escapeHtml(res.metadata.description) + '">\n'
        metas += '<meta name="twitter:description" content="' + escapeHtml(res.metadata.description) + '">\n'
        metas += '<meta property="og:description" content="' + escapeHtml(res.metadata.description) + '">\n'
    }
    if (res.metadata.image !== '') {
        metas += '<meta name="twitter:image:src" content="' + escapeHtml(res.metadata.image) + '" />\n'
        metas += '<meta property="og:image" content="' + escapeHtml(res.metadata.image) + '" />\n'
    }
    let lang = ''
    if (res.metadata.lang !== '') {
        lang = ' lang="' + escapeHtml(res.metadata.lang) + '"'
    }
    let dir = ''
    if (res.metadata.dir !== '') {
        dir = ' dir="' + escapeHtml(res.metadata.dir) + '"'
    }

    return layout
        .replace('{{lang}}', lang)
        .replace('{{dir}}', dir)
        .replace('{{metas}}', metas)
        .replace('{{main}}', res.main)
}

function defaultLayout(dark = false): string {
    return fs.readFileSync(path.join(__dirname, !dark ? '../layouts/layout.html' : '../layouts/layout.dark.html'), { encoding: 'utf-8' })
}

main()