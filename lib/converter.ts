import fs from 'fs'
import path from 'path'
import { MarkdownItYAMLMetadata } from './yaml-metadata'
import { MarkdownItContainer } from './container'

// const MarkdownItContainer = require('markdown-it-container')
const MarkdownIt = require('markdown-it')
const MarkdownItSub = require('markdown-it-sub')
const MarkdownItSup = require('markdown-it-sup')
const MarkdownItFootnote = require('markdown-it-footnote')
const MarkdownItDeflist = require('markdown-it-deflist')
const MarkdownItAbbr = require('markdown-it-abbr')
const MarkdownItEmoji = require('markdown-it-emoji')
const MarkdownItIns = require('markdown-it-ins')
const MarkdownItMark = require('markdown-it-mark')
const MarkdownItImsize = require('markdown-it-imsize')
const MarkdownItMathJax = require('markdown-it-mathjax')
const MarkdownItTOC = require('markdown-it-table-of-contents')
const MarkdownItAnchor = require('markdown-it-anchor')
const MarkdownItRuby = require('markdown-it-ruby')
const MarkdownItCheckbox = require('markdown-it-checkbox')

export class Convert {
  src: Array<string>
  dest: string
  layout: string
  md: any

  constructor (src: Array<string>, dest: string, layout: string, hardBreak: boolean) {
    this.src = src
    this.dest = dest
    this.layout = layout

    // https://hackmd.io/c/codimd-documentation/%2F%40codimd%2Fmarkdown-syntax
    this.md = new MarkdownIt({
      html: true,
      breaks: !hardBreak,
      linkify: true,
      typographer: true
    })
      .use(MarkdownItMathJax())
      .use(MarkdownItYAMLMetadata)
      .use(MarkdownItSub)
      .use(MarkdownItSup)
      .use(MarkdownItFootnote)
      .use(MarkdownItDeflist)
      .use(MarkdownItAbbr)
      .use(MarkdownItMark)
      .use(MarkdownItEmoji)
      .use(MarkdownItContainer)
      .use(MarkdownItIns)
      .use(MarkdownItImsize)
      .use(MarkdownItTOC, {
        markerPattern: /^\[toc\]/im,
        includeLevel: [1, 2, 3, 4]
      })
      .use(MarkdownItAnchor)
      .use(MarkdownItRuby)
      .use(MarkdownItCheckbox, {
        divWrap: true
      })
  }

  // @param html: html string
  // @return: html string with layout
  private addLayout (html: string): string {
    if (fs.existsSync(this.layout)) {
      const layout = fs.readFileSync(this.layout, { encoding: 'utf-8' })
      return layout.replace('{{main}}', html)
    }

    console.error(`${this.layout} is not found`)
    return html
  }

  // @param filepath: the path of the file should be converted
  // this function doesn't check the ext name of filepath
  public convertFile (filepath: string) {
    const markdown = fs.readFileSync(filepath, { encoding: 'utf-8' })
    // process yaml metadata
    // if (markdown.slice(0, 3) === '---') {
    //   markdown = '<!--yaml-metadata-->' + markdown
    // }
    const html = this.md.render(markdown)
    const res = this.addLayout(html)
    const basename = path.basename(filepath)
    fs.writeFileSync(path.join(this.dest, basename.replace(/\.md$/, '.html')), res)
  }

  public convertBatch () {
    if (!fs.existsSync(this.dest)) {
      fs.mkdirSync(this.dest)
    }
    this.src.forEach((fileOrDir: string) => {
      if (!fs.existsSync(fileOrDir)) {
        console.error(`${fileOrDir} is not found`)
        return
      }

      const stats = fs.statSync(fileOrDir)

      if (stats.isDirectory()) {
        fs.readdir(fileOrDir, (err: any, files: Array<string>) => {
          if (err) {
            throw (err)
          }
          files?.forEach((fn) => {
            if (path.extname(fn) === '.md') {
              this.convertFile(path.join(fileOrDir, fn))
            }
          })
        })
      } else if (stats.isFile()) {
        if (path.extname(fileOrDir) === '.md') {
          this.convertFile(fileOrDir)
        }
      }
    })
  }
}
