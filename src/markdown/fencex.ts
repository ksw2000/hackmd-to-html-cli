import MarkdownIt, { Token } from 'markdown-it';
import { PlantUML } from './plantUML'
import { renderFretBoard } from './fretboard'
import Papa from 'papaparse'
import { MyToken } from './token';

// modified from
// https://github.com/hackmdio/codimd/blob/develop/public/js/lib/markdown/utils.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseFenceCodeParams(lang: string): Map<string, any> {
    const attrMatch = lang.match(/{(.*)}/)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = new Map<string, any>()
    if (attrMatch && attrMatch.length >= 2) {
        const attrs = attrMatch[1]
        const paraMatch = attrs!.match(/([#.](\S+?)\s)|((\S+?)\s*=\s*("(.+?)"|'(.+?)'|\[[^\]]*\]|\{[}]*\}|(\S+)))/g)
        paraMatch?.forEach(param => {
            param = param.trim()
            if (param[0] === '#') {
                params.set('id', param.slice(1))
            } else if (param[0] === '.') {
                if (!params.get('class')) params.set('class', [])
                params.set('class', params.get('class').concat(param.slice(1)))
            } else {
                const offset = param.indexOf('=')
                const id = param.substring(0, offset).trim().toLowerCase()
                let val = param.substring(offset + 1).trim()
                const valStart = val[0] as string
                const valEnd = val[val.length - 1] as string
                if (['"', "'"].indexOf(valStart) !== -1 && ['"', "'"].indexOf(valEnd) !== -1 && valStart === valEnd) {
                    val = val.substring(1, val.length - 1)
                }
                if (id === 'class') {
                    if (params.get('class')) params.set('class', [])
                    params.set('class', params.get('class').concat(val))
                } else {
                    params.set(id, val)
                }
            }
        })
    }

    // convert "true" (string) to true (boolean) 
    params.forEach((val, key) => {
        if (val === 'true') {
            params.set(key, true)
        } else if (val === 'false') {
            params.set(key, false)
        }
    });
    return params
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MarkdownItFenceX(md: MarkdownIt, opts?: MarkdownIt.Options) {
    function codeX(state: MarkdownIt.StateCore): void {
        for (let i = 0; i < state.tokens.length; i++) {
            const token: Token = state.tokens[i]
            if (token.type === 'fence') {
                const params: string[] = token.info.split(' ')
                if (params[0] === 'csvpreview') {
                    const config = parseFenceCodeParams(params.slice(1).join(' '))
                    const res = Papa.parse<object>(token.content.trim(), Object.fromEntries(config))
                    const newTokens: Token[] = []
                    newTokens.push(new MyToken('csvtable_open', 'table', 1))
                    if (config.has('header') && (config.get('header') as boolean)) {
                        // render the header of table
                        if (res.data.length == 0) continue;

                        const keys = Object.keys(res.data[0]);
                        newTokens.push(new MyToken('csvtable_tr_open', 'tr', 1))
                        for (let j = 0; j < keys.length; j++) {
                            newTokens.push(new MyToken('csvtable_th_open', 'th', 1))
                            const content = new MyToken('text', '', 0)
                            content.content = keys[j]!
                            newTokens.push(content)
                            newTokens.push(new MyToken('csvtable_th_close', 'th', -1))
                        }
                        newTokens.push(new MyToken('csvtable_tr_close', 'tr', -1))

                        for (let j = 0; j < res.data.length; j++) {
                            const row = res.data[j]
                            const values = Object.values(row)
                            newTokens.push(new MyToken('csvtable_tr_open', 'tr', 1))
                            for (let k = 0; k < keys.length; k++) {
                                newTokens.push(new MyToken('csvtable_td_open', 'td', 1))
                                const content = new MyToken('text', '', 0)
                                content.content = values[k];
                                newTokens.push(content)
                                newTokens.push(new MyToken('csvtable_td_close', 'td', -1))
                            }
                            newTokens.push(new MyToken('csvtable_tr_close', 'tr', -1))
                        }
                    } else {
                        for (let j = 0; j < res.data.length; j++) {
                            const row = res.data[j]
                            const values = Object.values(row)
                            newTokens.push(new MyToken('csvtable_tr_open', 'tr', 1))
                            for (let k = 0; k < values.length; k++) {
                                newTokens.push(new MyToken('csvtable_td_open', 'td', 1))
                                const content = new MyToken('text', '', 0)
                                content.content = values[k]
                                newTokens.push(content)
                                newTokens.push(new MyToken('csvtable_td_close', 'td', -1))
                            }
                            newTokens.push(new MyToken('csvtable_tr_close', 'tr', -1))
                        }
                    }

                    newTokens.push(new MyToken('csvtable_close', 'table', -1))
                    state.tokens = md.utils.arrayReplaceAt(state.tokens, i, newTokens)
                } else if (params[0] === 'plantuml') {
                    const p = new PlantUML()
                    const url = p.generateURL('@startuml\n' + token.content.trim() + '\n@enduml')
                    const newTokens: Token[] = [token]
                    token.attrPush(['style', 'display:none;'])
                    const img = new MyToken('plantuml_img', 'img', 0)
                    img.attrs = [['src', 'https://ptuml.hackmd.io/svg/' + url],
                    ['class', 'language-plantuml-img'],
                    ['data-url', url]]
                    newTokens.push(img)
                    state.tokens = md.utils.arrayReplaceAt(state.tokens, i, newTokens)
                } else if (params[0] === 'fretboard') {
                    const config = parseFenceCodeParams(params.slice(1).join(' '))
                    const title = config.get('title') as string
                    const type = config.get('type') as string
                    const rendered = renderFretBoard(token.content, { title: title, type: type })
                    const fret = new MyToken('html_block', 'div', 0)
                    fret.content = rendered

                    state.tokens = md.utils.arrayReplaceAt(state.tokens, i, [fret])
                }
            }
        }
    }
    md.core.ruler.push('codeX', codeX)
}