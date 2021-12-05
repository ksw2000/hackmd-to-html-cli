# HackMD to HTML

A simple example that converts HackMD markdown files to HTML files and deploy these HTML files to gitpage.

## converter.js

1. converter.js reads `layout.html`
2. converter.js convert all files end in `.md` in `/input` into `*.html` and save results to `/output`.

## workflow

1. install `Node.js`
2. Execute `converter.js`
3. Commit all files in `/output`.

---

## TODO

wrap this repository to github action.