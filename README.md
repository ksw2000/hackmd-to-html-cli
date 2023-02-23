# hackmd-to-html-cli

[![NPM version](https://img.shields.io/npm/v/hackmd-to-html-cli.svg?logo=npm&style=flat-square)](https://www.npmjs.org/package/hackmd-to-html-cli) ![](https://img.shields.io/github/license/ksw2000/hackmd-to-html-cli?color=yellow&style=flat-square) ![](https://img.shields.io/github/actions/workflow/status/ksw2000/hackmd-to-html-cli/publish.yml?branch=main&style=flat-square) ![](https://img.shields.io/npm/dt/hackmd-to-html-cli?color=blue&style=flat-square)


A simple Node.js wrapper for `markdown-it`. This tool helps to convert HackMD markdown files to HTML files.

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

## TODO

+ Provide more templates & styles
+ Support more HackMD [syntax](https://hackmd.io/features-tw?both)
    + specifiy your name, time and color to vary the blockquotes.
    + YAML Metadata
    + Render CSV as table
    + PlantUML
    + Fretboard