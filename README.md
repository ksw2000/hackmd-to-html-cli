# hackmd-to-html-cli

[![NPM version](https://img.shields.io/npm/v/hackmd-to-html-cli.svg?logo=npm&style=flat-square)](https://www.npmjs.org/package/hackmd-to-html-cli) ![](https://img.shields.io/github/license/ksw2000/hackmd-to-html-cli?color=yellow&style=flat-square) ![](https://img.shields.io/github/actions/workflow/status/ksw2000/hackmd-to-html-cli/gitpage.yml?branch=main&style=flat-square) ![](https://img.shields.io/npm/dt/hackmd-to-html-cli?color=blue&style=flat-square)

Not only is this a CLI tool, but it is also an importable package for converting standard Markdown and even [HackMD](https://hackmd.io/)-supported Markdown into HTML.

+ See the example of input markdown: [./example/index.md](https://raw.githubusercontent.com/ksw2000/hackmd-to-html-cli/main/example/index.md)

+ See the example of output html: [https://ksw2000.github.io/hackmd-to-html-cli/](https://ksw2000.github.io/hackmd-to-html-cli/)

## Install

```sh
# CLI
npm install -g hackmd-to-html-cli

# Package
npm install hackmd-to-html-cli
```

## CLI

```sh
$ hmd2html --help
hmd2html --help
Usage: index [options]

Options:
  -v, --version                    output the current version
  -s, --source <files_or_dirs...>  specify the input markdown files or directories
  -d, --destination <path>         specify the output directory (default: ./output)
  -l, --layout <html_file>         specify the layout file (default: "")
  -b, --hardBreak                  use hard break instead of soft break
  -h, --help                       display help for command
```

**Convert**

```sh
# files
$ hmd2html -s file1.md file2.md file3.md

# directories
$ hmd2html -s ./dir1 ./dir2

# files or directories
$ hmd2html -s file1.md ./dir1

# Set output folder
$ hmd2html -s file1.md -d ./out

# Use custom layout
$ hmd2html -s hello.md -l ./myLayout.html
```

## Package (beta)

```js
const {Convert} = require('hackmd-to-html-cli')
const template = `{{main}}`
const hardBreak = true
const converter = new Convert(template, hardBreak)
const md = `
# title
hello world
`
console.log(converter.convert(md))
```

**output**

```
<h1 id="title" tabindex="-1">title</h1>
<p>hello world</p>
```

If you want to get default layout

```js
convert.defaultLayout()
```

If you want to get metadata after converting

```js
converter.getMetadata()
```

## Layout

See default layout here: https://github.com/ksw2000/hackmd-to-html-cli/blob/main/layout.html

+ `{{main}}` renders main content of markdown.
+ `{{lang}}` renders lang property if there are yaml metadata about `lang` in markdown file. e.g. `lang="zh-TW"`
+ `{{dir}}` renders dir property if there are yaml metadata about `dir` in markdown file. e.g. `dir="ltr"`
+ `{{meta}}` renders meta tag if there are yaml metadata about `title`, `description`, `robots` or`image`. e.g. `<meta name="robots" content="noindex">`

## Develop

1. `npm run lint` to check the format of source code.
2. `npm test` runs tests for this package, which generates result from `./example` and places them in `./output`.

## Support

`hmd2html`: our tool (the latest)

`HackMD Default Converter`: The default markdown to html converter provided by HackMD, i.e., download HTML file on HackMD.

HackMD fully supports syntax: [features](https://hackmd.io/features-tw?both)

| Features      | hmd2html  | HackMD Default Converter | |
|---------------|:---------:|:--:|:--:|
| ToC           | ✅       |✅||
| Emoji         | ✅       |✅||
| ToDo list     | ✅       |✅||
| Code block    | ✅       |✅||
| - Show line number or not       | ✅ |❌||
| - Specify the start line number | ✅ |❌|v0.0.7⬆|
| - Continue line number          | ✅ |❌|v0.0.8⬆|
| Blockquote          | ✅ |✅||
| - specify your name | ✅ |✅|v0.0.10⬆|
| - specify time      | ✅ |✅|v0.0.10⬆|
| - color             | ✅ |✅|v0.0.10⬆|
| Render CSV as table | ✅ |✅|v0.0.10⬆|
| MathJax       | ✅       |✅||
| Sequence diagrams  | ✅  |❌|v0.0.5⬆|
| Flow charts   | ✅       |❌|v0.0.5⬆|
| Graphviz      | ✅       |❌|v0.0.7⬆|
| Mermaid       | ✅       |❌|v0.0.5⬆|
| Abc           | ✅       |❌|v0.0.7⬆|
| PlantUML      | ✅       |✅|v0.0.10⬆|
| Vega-Lite     | ✅       |❌|v0.0.7⬆|
| Fretboard     | ✅       |❌|v0.0.11⬆|
| Alert Area    | ✅       |✅||
| Detail        | ✅       |✅||
| Spoiler container | ✅   |✅|v0.0.7⬆|
| Headers h1-h6 | ✅       |✅||
| Horizontal line| ✅      |✅| `---` `***`|
| Bold          | ✅       |✅| `**b**` `__b__`|
| Italic        | ✅       |✅| `*i*` `_i_`|
| Deleted text  | ✅       |✅| `~~del~~` |
| Superscript   | ✅       |✅| `^sup^` |
| Subscript     | ✅       |✅| `~sub~` |
| Inserted text | ✅       |✅| `++ins++` |
| Marked text   | ✅       |✅| `==mark==` |
| Ruby case     | ✅       |✅| |
| Typographic<br>replacements |✅|✅| |
| Blockquotes   | ✅       |✅||
| List          | ✅       |✅||
| Tables        | ✅       |✅||
| Links         | ✅       |✅||
| Link with title| ✅      |✅||
| Autoconverted link| ✅   |✅||
| Image         | ✅       |✅||
| - normal      | ✅       |✅||
| - with title  | ✅       |✅||
| - given size  | ✅       |✅||
| Footnotes     | ✅       |✅||
| Definition list| ✅      |✅||
| Abbreviations | ✅       |✅||

### Support Externals

| Features    | hmd2html  | HackMD Default Converter|
|-------------|:---------:|:---------:|
| Youtube     | ✅       | ✅        |
| Vimeo       | ✅       | ❌        |
| Gist        | ✅       | ✅        |
| SlideShare  | ❌       | ❌        |
| Speakerdeck | ✅       | ✅        |
| PDF         | ✅       | ✅        |
| Figma       | ✅       | ✅        |

### Support YAML Metadata

| Features      | hmd2html  | Implementation  |
|---------------|:---------:|:-------:|
| title         | ✅       | `<title></title>`<br>`<meta name="twitter:title">`<br>`<meta property="og:title">`|
| description   | ✅       | `<meta name="description">`<br>`<meta name="twitter:description">`<br>`<meta property="og:description">` |
| robots        | ✅       | `<meta name="robots">` |
| lang          | ✅       | `<html lang="">` |
| dir           | ✅       | `<html dir="">` |
| image         | ✅       | `<meta property="og:image">`<br>`<meta name="twitter:image:src">` |
| others        | ✅       | Hide the metadata by html comment |

HackMD sets the `lang` tag and `dir` tag at the beginning of `<body>`. hmd2html sets the the `lang` tag and `dir` tag at `<html>` when using default layout.

## TODO

+ Provide more templates & styles