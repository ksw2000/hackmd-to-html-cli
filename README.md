# HackMD to HTML cli

![](https://img.shields.io/github/workflow/status/liao2000/HackMD-to-HTML/publish?style=flat-square) 
[![NPM version](https://img.shields.io/npm/v/hackmd-to-html-cli.svg?style=flat-square)](https://www.npmjs.org/package/hackmd-to-html-cli)

A simple Node.js wrapper for `markdown-it`. This tool helps to convert HackMD markdown files to HTML files.

> See DEMO: [https://liao2000.github.io/HackMD-to-HTML/](https://liao2000.github.io/HackMD-to-HTML/)

## Install

```sh
npm install -g hackmd-to-html-cli
```

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
    + output
        + hello.html
    + hello.md
    + myLayout.html

**myLayout.html**
```html
<html>
    <head></head>
    <body>
        {{main}}
    </body>
</html>
```

**hello.md**
```markdown
# hello
```

**hello.html**
```html
<html>
    <head></head>
    <body>
        <h1>hello</h1>
    </body>
</html>
```

## TODO

+ Provide more template & styles
+ Automatically generate HTML `<title>`
+ Support more HackMD syntax