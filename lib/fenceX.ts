import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'
const Papa = require('papaparse')
const deflate = require('deflate-js')

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
        const map = new Map()

        config = config.trim()
        if (config[0] === '{' && config[config.length - 1] === '}') {
            config = config.substring(1, config.length - 1)
        } else {
            return map
        }

        const keyList: string[] = []
        const valueList: string[] = []
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
                    const key = config.substring(j, i).trim()
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
                } else if (config[i] === "'") {
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
            const token: Token = state.tokens[i]
            if (token.type === 'fence') {
                const params: string[] = token.info.split(" ")
                if (params[0] === 'csvpreview') {
                    const config = parseUserDefinedCSVTableConfig(params.slice(1).join(" "))
                    const res = Papa.parse(token.content.trim(), Object.fromEntries(config))
                    const newTokens: Token[] = []
                    newTokens.push(new Token('csvtable_open', 'table', 1))
                    if (config.has('header') && (config.get('header') as boolean)) {
                        // render header of table
                        if (res.data.length == 0) continue;

                        const keys = Object.keys(res.data[0]);
                        newTokens.push(new Token('csvtable_tr_open', 'tr', 1))
                        for (let j = 0; j < keys.length; j++) {
                            newTokens.push(new Token('csvtable_th_open', 'th', 1))
                            const content = new Token('text', '', 0)
                            content.content = keys[j]!
                            newTokens.push(content)
                            newTokens.push(new Token('csvtable_th_close', 'th', -1))
                        }
                        newTokens.push(new Token('csvtable_tr_close', 'tr', -1))

                        for (let j = 0; j < res.data.length; j++) {
                            const row = res.data[j]
                            newTokens.push(new Token('csvtable_tr_open', 'tr', 1))
                            for (let k = 0; k < keys.length; k++) {
                                newTokens.push(new Token('csvtable_td_open', 'td', 1))
                                const content = new Token('text', '', 0)
                                content.content = row[keys[k]!]
                                newTokens.push(content)
                                newTokens.push(new Token('csvtable_td_close', 'td', -1))
                            }
                            newTokens.push(new Token('csvtable_tr_close', 'tr', -1))
                        }
                    } else {
                        for (let j = 0; j < res.data.length; j++) {
                            const row = res.data[j]
                            newTokens.push(new Token('csvtable_tr_open', 'tr', 1))
                            for (let k = 0; k < row.length; k++) {
                                newTokens.push(new Token('csvtable_td_open', 'td', 1))
                                const content = new Token('text', '', 0)
                                content.content = row[k]
                                newTokens.push(content)
                                newTokens.push(new Token('csvtable_td_close', 'td', -1))
                            }
                            newTokens.push(new Token('csvtable_tr_close', 'tr', -1))
                        }
                    }

                    newTokens.push(new Token('csvtable_close', 'table', -1))
                    state.tokens = md.utils.arrayReplaceAt(state.tokens, i, newTokens)
                } else if (params[0] === 'plantuml') {
                    const p = new PlantUML()
                    const url = p.generateURL('@startuml\n' + token.content.trim() + '\n@enduml')
                    const newTokens: Token[] = [token]
                    token.attrPush(['style', 'display:none;'])
                    const img = new Token('plantuml_img', 'img', 0)
                    img.attrs = [['src', 'https://ptuml.hackmd.io/svg/' + url],
                    ['class', 'language-plantuml-img'],
                    ['data-url', url]]
                    newTokens.push(img)
                    state.tokens = md.utils.arrayReplaceAt(state.tokens, i, newTokens)
                }
            }
        }
    }

    md.core.ruler.push('codeX', codeX)
}

class PlantUML {
    private encode6bit(b: number): string {
        if (b < 10) {
            return String.fromCharCode(48 + b);
        }
        b -= 10;
        if (b < 26) {
            return String.fromCharCode(65 + b);
        }
        b -= 26;
        if (b < 26) {
            return String.fromCharCode(97 + b);
        }
        b -= 26;
        if (b == 0) {
            return '-';
        }
        if (b == 1) {
            return '_';
        }
        return '?';
    }

    private append3bytes(b1: number, b2: number, b3: number) {
        const c1 = b1 >> 2;
        const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
        const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
        const c4 = b3 & 0x3F;
        let r = "";
        r += this.encode6bit(c1 & 0x3F);
        r += this.encode6bit(c2 & 0x3F);
        r += this.encode6bit(c3 & 0x3F);
        r += this.encode6bit(c4 & 0x3F);
        return r;
    }

    private encode64(data: string) {
        let r = '';
        for (let i = 0; i < data.length; i += 3) {
            if (i + 2 == data.length) {
                r += this.append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
            } else if (i + 1 == data.length) {
                r += this.append3bytes(data.charCodeAt(i), 0, 0);
            } else {
                r += this.append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1),
                    data.charCodeAt(i + 2));
            }
        }
        return r;
    }

    public generateURL(value: string) {
        const encoded = new TextEncoder().encode(value);
        const compressedCharArray = deflate.deflate(encoded, 9);
        const compressed = String.fromCharCode.apply(null, compressedCharArray)
        return this.encode64(compressed);
    }
}