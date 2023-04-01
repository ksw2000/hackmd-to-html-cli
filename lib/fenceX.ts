import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'
const Papa = require('papaparse')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MarkdownItFenceX(md: MarkdownIt, _options: MarkdownIt.Options) {
    // Allowable syntax in HackMD
    // 1. basic case
    // input {header="true"}
    // output {header: true}

    // 2. multiple key-value like XML
    // input {delimiter = "." header = "true"}
    // output {delimiter: ".", header: true}

    // 3. without double quote
    // input {delimiter = .. header = true}
    // output {delimiter: "..", header: true}

    // input {delimiter = = header = true}
    // output {delimiter: "=", header: true}

    // input {delimiter = == header = true}
    // output {delimiter: "==", header: true}

    // 4. Also allow single quote
    // input {delimiter='.' header = true}
    // output {delimiter: ".", header: true}

    // 5. special case (Not always support in our package)
    // input {delimiter = = = = = header = true}
    // output {delimiter: "=", header: true}
    function parseUserDefinedCSVTableConfig(config: string): Map<string, any> {
        let map = new Map()

        config = config.trim()
        if (config[0] === '{' && config[config.length - 1] === '}') {
            config = config.substring(1, config.length - 1)
        } else {
            return map
        }

        let keyList: string[] = []
        let valueList: string[] = []
        let j = 0
        const parseKey = 0
        const prepareParseValue = 1
        const parseValueDoubleQuoteMode = 2
        const parseValueSingleQuoteMode = 3
        const parseValueWithoutQuoteMode = 4

        let state = parseKey
        for (let i = 0; i < config.length; i++) {
            if (state === parseKey) {
                if (config[i] === '=') {
                    let key = config.substring(j, i).trim()
                    if (key !== '') {
                        keyList.push(config.substring(j, i).trim())
                        state = prepareParseValue
                    }
                    j = i + 1
                }
            } else if (state === prepareParseValue) {
                if (config[i] === '"') {
                    state = parseValueDoubleQuoteMode
                    j = i + 1
                } else if (config[i] === '"') {
                    state = parseValueSingleQuoteMode
                    j = i + 1
                } else if (config[i] !== ' ') {
                    state = parseValueWithoutQuoteMode
                    j = i
                }
            } else if (state === parseValueDoubleQuoteMode) {
                if (config[i] === '"') {
                    valueList.push(config.substring(j, i))
                    j = i + 1
                    state = parseKey
                }
            } else if (state === parseValueSingleQuoteMode) {
                if (config[i] === "'") {
                    valueList.push(config.substring(j, i))
                    j = i + 1
                    state = parseKey
                }
            } else if (state === parseValueWithoutQuoteMode) {
                if (config[i] === ' ') {
                    valueList.push(config.substring(j, i))
                    j = i + 1
                    state = parseKey
                }
            }
        }
        if (keyList.length != valueList.length) {
            return map
        }
        for (let i = 0; i < keyList.length; i++) {
            if (valueList[i] === 'true') {
                map.set(keyList[i], true)
            } else if (valueList[i] === 'false') {
                map.set(keyList[i], false)
            } else {
                map.set(keyList[i], valueList[i])
            }
        }
        return map
    }

    function codeX(state: any): void {
        for (let i = 0; i < state.tokens.length; i++) {
            let token: Token = state.tokens[i]
            if (token.type === 'fence') {
                let params: string[] = token.info.split(" ")
                if (params[0] === 'csvpreview') {
                    let config = parseUserDefinedCSVTableConfig(params.slice(1).join(" "))
                    var res = Papa.parse(token.content.trim(), Object.fromEntries(config))
                    let newTokens: Token[] = []
                    newTokens.push(new Token('csvtable_open', 'table', 1))
                    if (config.has('header') && (config.get('header') as boolean)) {
                        // render header of table
                        if (res.data.length == 0) continue;

                        let keys = Object.keys(res.data[0]);
                        newTokens.push(new Token('csvtable_tr_open', 'tr', 1))
                        for (let j = 0; j < keys.length; j++) {
                            newTokens.push(new Token('csvtable_th_open', 'th', 1))
                            let content = new Token('text', '', 0)
                            content.content = keys[j]!
                            newTokens.push(content)
                            newTokens.push(new Token('csvtable_th_close', 'th', -1))
                        }
                        newTokens.push(new Token('csvtable_tr_close', 'tr', -1))

                        for (let j = 0; j < res.data.length; j++) {
                            let row = res.data[j]
                            newTokens.push(new Token('csvtable_tr_open', 'tr', 1))
                            for (let k = 0; k < keys.length; k++) {
                                newTokens.push(new Token('csvtable_td_open', 'td', 1))
                                let content = new Token('text', '', 0)
                                content.content = row[keys[k]!]
                                newTokens.push(content)
                                newTokens.push(new Token('csvtable_td_close', 'td', -1))
                            }
                            newTokens.push(new Token('csvtable_tr_close', 'tr', -1))
                        }
                    } else {
                        for (let j = 0; j < res.data.length; j++) {
                            let row = res.data[j]
                            newTokens.push(new Token('csvtable_tr_open', 'tr', 1))
                            for (let k = 0; k < row.length; k++) {
                                newTokens.push(new Token('csvtable_td_open', 'td', 1))
                                let content = new Token('text', '', 0)
                                content.content = row[k]
                                newTokens.push(content)
                                newTokens.push(new Token('csvtable_td_close', 'td', -1))
                            }
                            newTokens.push(new Token('csvtable_tr_close', 'tr', -1))
                        }
                    }

                    newTokens.push(new Token('csvtable_close', 'table', -1))
                    state.tokens = md.utils.arrayReplaceAt(state.tokens, i, newTokens)
                }
            }
        }
    }

    md.core.ruler.push('codeX', codeX)
}