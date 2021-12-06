import fs from 'fs';
import path from 'path';
const MarkdownIt = require('markdown-it');
const MarkdownItContainer = require('markdown-it-container');
const MarkdownItKaTex = require('markdown-it-katex');
const MarkdownItEmoji = require('markdown-it-emoji');
const MarkdownItTableOfContents = require("markdown-it-table-of-contents");
const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
}).use(MarkdownItTableOfContents, {
    markerPattern: /^\[toc\]/im
}).use(MarkdownItKaTex)
    .use(MarkdownItEmoji)
    .use(MarkdownItContainer, 'success')
    .use(MarkdownItContainer, 'info')
    .use(MarkdownItContainer, 'warning')
    .use(MarkdownItContainer, 'danger');

export class Convert {
    src: Array<string>;
    dest: string;
    layout: string;

    constructor(src: Array<string>, dest: string, layout: string) {
        this.src = src;
        this.dest = dest;
        this.layout = layout;
    }

    // @param html: html string
    // @return: html string with layout
    private addLayout(html: string): string {
        if (fs.existsSync(this.layout)) {
            let layout = fs.readFileSync(this.layout, { encoding: 'utf-8' });
            return layout.replace('{{main}}', html);
        }

        console.error(`${this.layout} is not found`);
        return html;
    }

    // @param filepath: the path of the file should be converted
    // this function doesn't check the ext name of filepath
    public convertFile(filepath: string) {
        let markdown = fs.readFileSync(filepath, { encoding: 'utf-8' });
        let html = md.render(markdown);
        let res = this.addLayout(html);
        let basename = path.basename(filepath);
        fs.writeFileSync(path.join(this.dest, basename.replace(/\.md\b/, '.html')), res);
    }

    public convertBatch() {
        if (!fs.existsSync(this.dest)){
            fs.mkdirSync(this.dest);
        }
        this.src.forEach((fileOrDir: string) => {
            if (!fs.existsSync(fileOrDir)){
                console.error(`${fileOrDir} is not found`);
                return;
            }

            let stats = fs.statSync(fileOrDir);

            if (stats.isDirectory()) {
                fs.readdir(fileOrDir, (err: any, files: Array<string>) => {
                    if (err) {
                        throw (err);
                    }
                    files?.forEach(fn => {
                        if (path.extname(fn) === '.md') {
                            this.convertFile(path.join(fileOrDir, fn));
                        }
                    });
                });
            } else if (stats.isFile()) {
                if (path.extname(fileOrDir) === '.md') {
                    this.convertFile(fileOrDir);
                }
            }
        });
    }
}
