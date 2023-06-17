import MarkdownIt from 'markdown-it/lib'
import StateCore from 'markdown-it/lib/rules_core/state_core'
import Token from 'markdown-it/lib/token'

export enum BlockquoteTokenProperty {
    name,
    time,
    color,
    text,
    blockquoteXStart,
    blockquoteXEnd
}

export class BlockquoteToken {
    public property: BlockquoteTokenProperty
    public value: string
    constructor(property: BlockquoteTokenProperty, value: string) {
        this.property = property
        this.value = value
    }
}

export function parseBlockquoteParams(src: string): BlockquoteToken[] {
    // [name=ChengHan Wu] [time=Sun, Jun 28, 2015 10:00 PM] [color=red]
    const pattern = /\[(.*?)=(.*?)\]/g
    const matching = [...src.matchAll(pattern)]
    if (matching.length === 0) return []
    const tokens: BlockquoteToken[] = []
    let j = 0;
    let blockquoteStart = false;  // decide whether close
    for (let i = 0; i < matching.length; i++) {
        const property: string = matching[i]![1]?.trim() ?? ''
        const value: string = matching[i]![2] ?? ''
        const textLen: number = matching[i]![0].length ?? 0
        const pos: number = matching[i]?.index ?? 0
        if (pos > j) {
            if (blockquoteStart) {
                tokens.push(new BlockquoteToken(BlockquoteTokenProperty.blockquoteXEnd, ''))
                blockquoteStart = false
            }
            // normal text
            tokens.push(new BlockquoteToken(BlockquoteTokenProperty.text, src.substring(j, pos)))
        }
        switch (property) {
            case 'name':
                if (tokens.length == 0 || tokens[tokens.length - 1]?.property === BlockquoteTokenProperty.text) {
                    if (blockquoteStart) {
                        tokens.push(new BlockquoteToken(BlockquoteTokenProperty.blockquoteXEnd, ''))
                    }
                    tokens.push(new BlockquoteToken(BlockquoteTokenProperty.blockquoteXStart, ''))
                    blockquoteStart = true
                }
                tokens.push(new BlockquoteToken(BlockquoteTokenProperty.name, value.trimStart()))
                break
            case 'time':
                if (tokens.length == 0 || tokens[tokens.length - 1]?.property === BlockquoteTokenProperty.text) {
                    if (blockquoteStart) {
                        tokens.push(new BlockquoteToken(BlockquoteTokenProperty.blockquoteXEnd, ''))
                    }
                    tokens.push(new BlockquoteToken(BlockquoteTokenProperty.blockquoteXStart, ''))
                    blockquoteStart = true
                }
                tokens.push(new BlockquoteToken(BlockquoteTokenProperty.time, value.trimStart()))
                break
            case 'color':
                tokens.push(new BlockquoteToken(BlockquoteTokenProperty.color, value.trimStart()))
                break
            default:
                tokens.push(new BlockquoteToken(BlockquoteTokenProperty.text, value))
                break
        }
        j = pos + textLen + 1
    }
    if (blockquoteStart) {
        tokens.push(new BlockquoteToken(BlockquoteTokenProperty.blockquoteXEnd, ''))
        blockquoteStart = false
    }
    if (src.length != j) {
        tokens.push(new BlockquoteToken(BlockquoteTokenProperty.text, src.substring(j, src.length)))
    }
    return tokens
}

export function MarkdownItBlockquoteX(md: MarkdownIt) {
    function blockquoteX(state: StateCore): void {
        const blockTokens = state.tokens
        let detect = false
        let blockquoteOpenAt = 0
        for (let j = 0; j < blockTokens.length; j++) {
            if (blockTokens[j]!.type === 'blockquote_open') {
                blockquoteOpenAt = j
                detect = true
            }
            if (blockTokens[j]!.type === 'blockquote_close') {
                detect = false
            }

            if (!detect) {
                continue
            }

            if (blockTokens[j]!.type === 'inline') {
                for (let n = 0; n < blockTokens[j]!.children!.length; n++) {
                    // find text token
                    if (blockTokens[j]!.children![n]!.type !== "text") continue;

                    // avoid matching same children[n]
                    let nextN = n

                    // try to parse
                    const m = parseBlockquoteParams(blockTokens[j]!.children![n]!.content)
                    if (m.length === 0) continue

                    // render
                    const newTokens: Token[] = []

                    // when the content is
                    // [invalid] [name] [time]
                    // we want to render
                    //
                    // <span>[invalid]<span>
                    // <span class="blockquoteX">
                    //     <span class="material-symbols-outlined material-symbols-outlined-fill">
                    //        name
                    //     </span>
                    //     <span class="material-symbols-outlined">
                    //        time
                    //     </span>
                    // </span>
                    // we only add the class `blockquoteX` before the `name` or `time`

                    // In hackMD, it only supports the format [name=blablabla] or [name= blablabla].
                    // However, in hmd2html, we use looser constraints, meaning it supports spaces between words.
                    // e.g. [ name = blablabla ]

                    let token: Token

                    // parse name, time, color
                    let color = '';
                    for (let s = 0; s < m.length; s++) {
                        const property: BlockquoteTokenProperty | undefined = m[s]?.property
                        const value: string = m[s]?.value ?? ''
                        switch (property) {
                            case BlockquoteTokenProperty.blockquoteXStart:
                                token = new Token('blockquoteX_open', 'span', 1)
                                token.attrs = [['class', 'blockquoteX']]
                                newTokens.push(token)
                                break
                            case BlockquoteTokenProperty.blockquoteXEnd:
                                token = new Token('blockquoteX_close', 'span', -1)
                                newTokens.push(token)
                                break
                            case BlockquoteTokenProperty.name:
                                token = new Token('blockquoteX_name_open', 'span', 1)
                                token.attrs = [['class', 'material-symbols-outlined material-symbols-outlined-fill']]
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = 'person'
                                newTokens.push(token)
                                token = new Token('blockquoteX_name_close', 'span', -1)
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = value.trim()
                                newTokens.push(token)
                                break
                            case BlockquoteTokenProperty.time:
                                token = new Token('blockquoteX_date_open', 'span', 1)
                                token.attrs = [['class', 'material-symbols-outlined']]
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = 'schedule'
                                newTokens.push(token)
                                token = new Token('blockquoteX_date_close', 'span', -1)
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = value.trim()
                                newTokens.push(token)
                                break
                            case BlockquoteTokenProperty.text:
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = value
                                newTokens.push(token)
                                break
                            case BlockquoteTokenProperty.color:
                                color = value ?? ''
                        }
                    }
                    blockTokens[j]!.children = md.utils.arrayReplaceAt(blockTokens[j]!.children!, n, newTokens)
                    if (color != '') {
                        blockTokens[blockquoteOpenAt]!.attrs = [['style', 'border-color:' + color + ';']]
                    }
                    n = nextN
                }
            }
        }
    }
    md.core.ruler.push('blockquoteX', blockquoteX)
}