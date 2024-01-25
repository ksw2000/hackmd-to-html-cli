import fs from 'fs'
import path from 'path'
import { MarkdownItYAMLMetadata, Metadata } from './markdown/yamlMetadata'
import { MarkdownItContainer } from './markdown/container'
import { MarkdownItCheckbox } from './markdown/checkbox'
import { MarkdownItExternal } from './markdown/external'
import { MarkdownItBlockquoteX } from './markdown/blockquotex'
import { MarkdownItFenceX } from './markdown/fencex'
import MarkdownIt from 'markdown-it/lib'

const MarkdownItSub = require('markdown-it-sub')
const MarkdownItSup = require('markdown-it-sup')
const MarkdownItFootnote = require('markdown-it-footnote')
const MarkdownItDeflist = require('markdown-it-deflist')
const MarkdownItAbbr = require('markdown-it-abbr')
const MarkdownItEmoji = require('markdown-it-emoji')
const MarkdownItIns = require('markdown-it-ins')
const MarkdownItMark = require('markdown-it-mark')
const MarkdownItImsize = require('markdown-it-imsize')
const MarkdownItMathJax3 = require('markdown-it-mathjax3')
const MarkdownItTOC = require('markdown-it-table-of-contents')
const MarkdownItAnchor = require('markdown-it-anchor')
const MarkdownItRuby = require('markdown-it-ruby')
const htmlEncode = require('htmlencode').htmlEncode;

export class Converter {
    private md: MarkdownIt
    private metadata: Metadata
    private layout: fs.PathLike

    /**
     * @param layout set null if you want to use default layout, 
     * @param hardBreak set true if want to use hardBread
     */
    constructor(layout: fs.PathLike | null, hardBreak = false, darkMode = false) {
        this.metadata = new Metadata()
        if (layout === null) {
            layout = this.defaultLayout(darkMode)
        }
        this.layout = layout
        // https://hackmd.io/c/codimd-documentation/%2F%40codimd%2Fmarkdown-syntax
        this.md = new MarkdownIt({
            html: true,
            breaks: !hardBreak,
            linkify: true,
            typographer: true
        })
            .use(MarkdownItMathJax3)
            .use(MarkdownItSub)
            .use(MarkdownItSup)
            .use(MarkdownItFootnote)
            .use(MarkdownItDeflist)
            .use(MarkdownItAbbr)
            .use(MarkdownItMark)
            .use(MarkdownItEmoji)
            .use(MarkdownItIns)
            .use(MarkdownItImsize)
            .use(MarkdownItTOC, {
                markerPattern: /^\[toc\]/im,
                includeLevel: [1, 2, 3, 4]
            })
            .use(MarkdownItYAMLMetadata, (metadata: Metadata) => {
                this.metadata = metadata
            })
            .use(MarkdownItAnchor)
            .use(MarkdownItRuby)
            .use(MarkdownItContainer)
            .use(MarkdownItCheckbox)
            .use(MarkdownItExternal)
            .use(MarkdownItBlockquoteX)
            .use(MarkdownItFenceX)
    }

    /**
     * @param main main HTML string converted by MarkdownIt 
     * @returns generated code
     */
    private useLayout(main: string): string {
        const metadata = this.metadata
        let metas = ''
        if (metadata.title !== '') {
            metas += '<title>' + htmlEncode(metadata.title) + '</title>\n'
            metas += '<meta name="twitter:title" content="' + htmlEncode(metadata.title) + '" />\n'
            metas += '<meta property="og:title" content="' + htmlEncode(metadata.title) + '" />\n'
        }
        if (metadata.robots !== '') {
            metas += '<meta name="robots" content="' + htmlEncode(metadata.robots) + '">\n'
        }
        if (metadata.description !== '') {
            metas += '<meta name="description" content="' + htmlEncode(metadata.description) + '">\n'
            metas += '<meta name="twitter:description" content="' + htmlEncode(metadata.description) + '">\n'
            metas += '<meta property="og:description" content="' + htmlEncode(metadata.description) + '">\n'
        }
        if (metadata.image !== '') {
            metas += '<meta name="twitter:image:src" content="' + htmlEncode(metadata.image) + '" />\n'
            metas += '<meta property="og:image" content="' + htmlEncode(metadata.image) + '" />\n'
        }
        let lang = ''
        if (metadata.lang !== '') {
            lang = ' lang="' + htmlEncode(metadata.lang) + '"'
        }
        let dir = ''
        if (metadata.dir !== '') {
            dir = ' dir="' + htmlEncode(metadata.dir) + '"'
        }

        return `${this.layout}`
            .replace('{{lang}}', lang)
            .replace('{{dir}}', dir)
            .replace('{{metas}}', metas)
            .replace('{{main}}', main)
    }

    /**
     * @param markdown markdown text
     * @returns generated html text
     */
    public convert(markdown: string): string {
        const html = this.md.render(markdown)
        return this.useLayout(html)
    }

    /**
     * Get metadata after converting.
     * Before calling this function, Please call convert() first
     * @returns metadata of the markdown file
     */
    public getMetadata(): Metadata {
        return this.metadata
    }

    /**
     * @returns default HTML layout
     */
    public defaultLayout(dark = false): string {
        return fs.readFileSync(path.join(__dirname, !dark ? '../layout.html' : '../layout.dark.html'), { encoding: 'utf-8' })
    }
}