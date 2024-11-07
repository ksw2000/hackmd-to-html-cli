import { MarkdownItYAMLMetadata, Metadata } from './markdown/yamlMetadata'
import { MarkdownItContainer } from './markdown/container'
import { MarkdownItCheckbox } from './markdown/checkbox'
import { MarkdownItExternal } from './markdown/external'
import { MarkdownItBlockquoteX } from './markdown/blockquotex'
import { MarkdownItFenceX } from './markdown/fencex'
import MarkdownIt from 'markdown-it'
import MarkdownItSub from 'markdown-it-sub'
import MarkdownItSup from 'markdown-it-sup'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItDeflist from 'markdown-it-deflist'
import MarkdownItAbbr from 'markdown-it-abbr'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItIns from 'markdown-it-ins'
import MarkdownItMark from 'markdown-it-mark'
import MarkdownItImsize from 'markdown-it-imsize'
import MarkdownItMathJax3 from 'markdown-it-mathjax3'
import MarkdownItTOC from 'markdown-it-table-of-contents'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItRuby from 'markdown-it-ruby'

export interface ConvertedResult {
    main: string;
    metadata: Metadata;
}

export class Converter {
    private md: MarkdownIt
    private metadata?: Metadata

    /**
     * @param layout set null if you want to use default layout, 
     * @param hardBreak set true if want to use hardBread
     */
    constructor(options: MarkdownIt.Options = {
        html: true,
        breaks: true,
        linkify: true,
        typographer: true
    }) {
        // https://hackmd.io/c/codimd-documentation/%2F%40codimd%2Fmarkdown-syntax
        this.md = new MarkdownIt(options)
            .use(MarkdownItMathJax3)
            .use(MarkdownItSub)
            .use(MarkdownItSup)
            .use(MarkdownItFootnote)
            .use(MarkdownItDeflist)
            .use(MarkdownItAbbr)
            .use(MarkdownItMark)
            .use(MarkdownItEmoji.full)
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
     * @param markdown markdown text
     * 
     * @returns ConvertedResult contains `main` and `metadata`
     *
     * ```
     * ConvertedResult {
     *       main: string;        // generated html text
     *       metadata: Metadata;  // parsed metadata
     * }
     * 
     * Metadata {
     *       title: string;
     *       description: string;
     *       lang: string;
     *       robots: string;
     *       dir: string;
     *       image: string;
     * }
     * ```
     */
    public render(markdown: string): ConvertedResult {
        const main = this.md.render(markdown)
        return {
            main: main,
            metadata: this.metadata ?? {
                title: '',
                description: '',
                lang: '',
                robots: '',
                dir: '',
                image: ''
            }
        }
    }
}