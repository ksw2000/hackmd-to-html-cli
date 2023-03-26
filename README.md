# hackmd-to-html-cli

[![NPM version](https://img.shields.io/npm/v/hackmd-to-html-cli.svg?logo=npm&style=flat-square)](https://www.npmjs.org/package/hackmd-to-html-cli) ![](https://img.shields.io/github/license/ksw2000/hackmd-to-html-cli?color=yellow&style=flat-square) ![](https://img.shields.io/github/actions/workflow/status/ksw2000/hackmd-to-html-cli/gitpage.yml?branch=main&style=flat-square) ![](https://img.shields.io/npm/dt/hackmd-to-html-cli?color=blue&style=flat-square)

Convert [HackMD](https://hackmd.io/) markdown to HTML.

## Install

```sh
npm install -g hackmd-to-html-cli
```

Input: [./example/index.md](https://raw.githubusercontent.com/ksw2000/hackmd-to-html-cli/main/example/index.md)

Output: [https://ksw2000.github.io/hackmd-to-html-cli/](https://ksw2000.github.io/hackmd-to-html-cli/)

## Usage

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

### Convert

```sh
# files
$ hmd2html -s file1.md file2.md file3.md

# directories
$ hmd2html -s ./dir1 ./dir2

# files or directories
$ hmd2html -s file1.md ./dir1
```

### Set output folder

```sh
$ hmd2html -s file1.md -d ./out
```

### Use custom layout

```sh
$ hmd2html -s hello.md -l ./myLayout.html
```

+ /
    + output/ *generated*
        + hello.html
    + hello.md
    + myLayout.html

**./myLayout.html**
```html
<html>
    <head></head>
    <body>
        {{main}}
    </body>
</html>
```

**./hello.md**
```markdown
# hello
```

**./output/hello.html**
```html
<html>
    <head></head>
    <body>
        <h1>hello</h1>
    </body>
</html>
```

## Develop

1. `npm run lint` to check the format of source code.
2. `npm test` to test this package, which generates result from `./example` into `./output`.

## Support

`hmd2html`: our tool (the latest)

`HackMD Online`: HackMD Online Editor

`HackMD Default Converter`: The default markdown to html converter provided by HackMD i.e., download HTML file on HackMD.

| Features      | hmd2html  | HackMD Online | HackMD Default Converter | |
|---------------|:---------:|:-------:|--|--|
| ToC           | ✅       |    ✅   |✅||
| Emoji         | ✅       |    ✅   |✅||
| ToDo list     | ✅       |    ✅   |✅||
| Code block    | ✅       |    ✅   |✅||
| - Show line number or not | ✅ | ✅ |❌||
| - Specify the start line number | ✅ | ✅ |❌|v0.0.7⬆|
| - Continue line number | ✅ |  ✅  |❌|v0.0.8⬆|
| Blockquote    |  ✅       |    ✅  |✅||
| - specify your name | ❌  |    ✅  |✅||
| - specify time | ❌       |    ✅  |✅||
| - color to vary the blockquoutes | ❌ | ✅ |✅||
| Render CSV as table | ❌  |    ✅  |✅||
| MathJax       | ✅        |   ✅   |✅||
| Sequence diagrams  | ✅   |   ✅   |❌|v0.0.5⬆|
| Flow charts   | ✅        |   ✅   |❌|v0.0.5⬆|
| Graphviz      | ✅        |   ✅   |❌|v0.0.7⬆|
| Mermaid       | ✅        |   ✅   |❌|v0.0.5⬆|
| Abc           | ✅        |   ✅   |❌|v0.0.7⬆|
| PlantUML      | ❌        |   ✅   |✅||
| Vega-Lite     | ✅        |   ✅   |❌|v0.0.7⬆|
| Fretboard     | ❌        |   ✅   |❌||
| Alert Area    | ✅        |   ✅   |✅||
| Detail        | ✅        |   ✅   |✅||
| Spoiler container | ✅    |   ✅   |✅|v0.0.7⬆|
| Headers h1-h6 | ✅        |   ✅   |✅||
| Horizontal line| ✅       |   ✅   |✅| `---` `***`|
| Bold          | ✅        |   ✅   |✅| `**b**` `__b__`|
| Italic        | ✅        |   ✅   |✅| `*i*` `_i_`|
| Deleted text  | ✅        |   ✅   |✅| `~~del~~` |
| Superscript   | ✅        |   ✅   |✅| `^sup^` |
| Subscript     | ✅        |   ✅   |✅| `~sub~` |
| Inserted text | ✅        |   ✅   |✅| `++ins++` |
| Marked text   | ✅        |   ✅   |✅| `==mark==` |
| Ruby case     | ✅        |   ✅   |✅| |
| Typographic<br>replacements | ✅ | ✅ |✅| |
| Blockquotes   | ✅        |   ✅   |✅| |
| List          | ✅        |   ✅   |✅| |
| Tables        | ✅        |   ✅   |✅| |
| Links         | ✅        |   ✅   |✅| |
| Link with title| ✅       |   ✅   |✅||
| Autoconverted link| ✅    |   ✅   |✅||
| Image         | ✅       |   ✅   |✅||
| - normal      | ✅       |   ✅   |✅||
| - with title  | ✅       |   ✅   |✅||
| - given size  | ✅       |   ✅   |✅||
| Footnotes     | ✅       |   ✅   |✅||
| Definition list| ✅      |   ✅   |✅||
| Abbreviations | ✅       |   ✅   |✅||

### Support Externals

| Features    | hmd2html  | HackMD Online | HackMD Default Converter|
|-------------|:---------:|:-------:|--|
| Youtube     | ✅        |   ✅   |✅|
| Vimeo       | ✅        |   ❌   |❌|
| Gist        | ✅        |   ✅   |✅|
| SlideShare  | ❌        |   ❌   |❌|
| Speakerdeck | ✅        |   ✅   |✅|
| PDF         | ✅        |   ✅   |✅|
| Figma       | ✅        |   ✅   |✅|

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

HackMD sets the `lang` tag and `dir` tag at the beginning of `<body>`. hmd2html sets the the `lang` tag and `dir` tag at `<html>`.

## TODO

+ Provide more templates & styles
+ Support more HackMD [syntax](https://hackmd.io/features-tw?both)