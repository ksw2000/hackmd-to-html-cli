import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

class MyToken {
    // name, time, color, text
    // blockquoteX_start, blockquoteX_end
    public property: string
    public value: string
    constructor(property: string, value: string) {
        this.property = property
        this.value = value
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MarkdownItBlockquoteX(md: MarkdownIt, _options: any) {
    function match(src: string): MyToken[] {
        // [name=ChengHan Wu] [time=Sun, Jun 28, 2015 10:00 PM] [color=red]
        let pattern = /\[(.*?)=(.*?)\]/g
        let matching = [...src.matchAll(pattern)]
        if (matching.length === 0) return []
        let tokens: MyToken[] = []
        let j = 0;
        let blockquoteStart = false;  // decide whether close
        for (let i = 0; i < matching.length; i++) {
            let property: string = matching[i]![1]?.trim() ?? ''
            let value: string = matching[i]![2] ?? ''
            let textLen: number = matching[i]![0].length ?? 0
            let pos: number = matching[i]?.index ?? 0
            // console.log("j:", j, "pos:", pos)
            if (pos > j) {
                if (blockquoteStart) {
                    tokens.push(new MyToken('blockquoteX_end', ''))
                    blockquoteStart = false
                }
                // normal text
                tokens.push(new MyToken('text', src.substring(j, pos)))
            }
            switch (property) {
                case 'name':
                    if (tokens.length == 0 || tokens[tokens.length - 1]?.property === 'text') {
                        if (blockquoteStart) {
                            tokens.push(new MyToken('blockquoteX_end', ''))
                        }
                        tokens.push(new MyToken('blockquoteX_start', ''))
                        blockquoteStart = true
                    }
                    tokens.push(new MyToken('name', value))
                    break
                case 'time':
                    if (tokens.length == 0 || tokens[tokens.length - 1]?.property === 'text') {
                        if (blockquoteStart) {
                            tokens.push(new MyToken('blockquoteX_end', ''))
                        }
                        tokens.push(new MyToken('blockquoteX_start', ''))
                        blockquoteStart = true
                    }
                    tokens.push(new MyToken('time', value))
                    break
                case 'color':
                    tokens.push(new MyToken('color', value))
                    break
                default:
                    tokens.push(new MyToken('text', value))
                    break
            }
            j = pos + textLen + 1
        }
        if (blockquoteStart) {
            tokens.push(new MyToken('blockquoteX_end', ''))
            blockquoteStart = false
        }
        if (src.length != j) {
            tokens.push(new MyToken('text', src.substring(j, src.length)))
        }
        return tokens
    }

    function blockquoteX(state: any): void {
        const blockTokens = state.tokens
        let detect = false
        let blockquoteOpenAt = 0
        for (let j = 0; j < blockTokens.length; j++) {
            if (blockTokens[j].type === 'blockquote_open') {
                blockquoteOpenAt = j
                detect = true
            }
            if (blockTokens[j].type === 'blockquote_close') {
                detect = false
            }

            if (!detect) {
                continue
            }

            if (blockTokens[j].type === 'inline') {
                let children = blockTokens[j].children
                for (let n = 0; n < blockTokens[j].children.length; n++) {
                    // find text token
                    if (blockTokens[j].children[n].type !== "text") continue;

                    // avoid matching same children[n]
                    let nextN = n

                    // try to parse
                    const m = match(blockTokens[j].children[n].content)
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

                    // In hackMD supports only [name=blablabla] or [name= blablabla]
                    // but in hmd2html, we use looser rules i.e., support spaces between words
                    // e.g. [ name = blablabla ]

                    let token: Token

                    // parse name, time, color
                    let color: string = '';
                    for (let s = 0; s < m.length; s++) {
                        console.log(m[s]?.property, m[s]?.value)



                        // console.log(m[s])
                        let property: string = m[s]?.property ?? ''
                        let value: string = m[s]?.value ?? ''
                        switch (property) {
                            case 'blockquoteX_start':
                                token = new Token('blockquoteX_open', 'span', 1)
                                token.attrs = [['class', 'blockquoteX']]
                                newTokens.push(token)
                                break
                            case 'blockquoteX_end':
                                token = new Token('blockquoteX_close', 'span', -1)
                                newTokens.push(token)
                                break
                            case 'name':
                                token = new Token('blockqouteX_name_open', 'span', 1)
                                token.attrs = [['class', 'material-symbols-outlined material-symbols-outlined-fill']]
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = 'person'
                                newTokens.push(token)
                                token = new Token('blockqouteX_name_close', 'span', -1)
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = value.trim()
                                newTokens.push(token)
                                break
                            case 'time':
                                token = new Token('blockqouteX_date_open', 'span', 1)
                                token.attrs = [['class', 'material-symbols-outlined']]
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = 'schedule'
                                newTokens.push(token)
                                token = new Token('blockqouteX_date_close', 'span', -1)
                                newTokens.push(token)
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = value.trim()
                                newTokens.push(token)
                                break
                            case 'text':
                                token = new Token('text', '', 0)
                                nextN++
                                token.content = value
                                newTokens.push(token)
                                break
                            case 'color':
                                color = value ?? ''
                        }
                    }
                    children = md.utils.arrayReplaceAt(children, n, newTokens)
                    blockTokens[j].children = children
                    if (color != '') {
                        blockTokens[blockquoteOpenAt].attrs = [['style', 'border-color:' + color + ';']]
                    }
                    n = nextN
                }
            }
        }
    }
    md.core.ruler.push('blockquoteX', blockquoteX)
}