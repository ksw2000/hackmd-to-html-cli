const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const MarkdownItContainer = require('markdown-it-container');
const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
}).use(require("markdown-it-table-of-contents"), {
    markerPattern: /^\[toc\]/im
}).use(require('markdown-it-katex'))
    .use(require('markdown-it-emoji'))
    .use(MarkdownItContainer, 'success')
    .use(MarkdownItContainer, 'info')
    .use(MarkdownItContainer, 'warning')
    .use(MarkdownItContainer, 'danger');


const srcDir = './input';
const destDir = './output';
var layout = `{{main}}`;
// load html render
if(fs.existsSync('layout.html')){
    layout = fs.readFileSync('layout.html', { encoding: 'utf-8' });
}

function htmlRender(html) {
    return layout.replace('{{main}}', html);
}

// 1. read source directory and use markdownIt() to convert .md files
// 2. write the converted files to destination directory
fs.mkdirSync('output');
fs.readdir(srcDir, (err, files) => {
    files?.forEach(fn => {
        if(path.extname(fn) === '.md'){
            input = path.join(srcDir, fn);
            output = path.join(destDir, fn.replace('.md', '.html'));
            var str = fs.readFileSync(input, { encoding: 'utf-8' });
            var res = md.render(str);
            res = htmlRender(res);
            fs.writeFileSync(output, res);
        }
    });
});