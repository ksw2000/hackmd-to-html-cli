import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

// modified from https://github.com/mcecot/markdown-it-checkbox
export function MarkdownItCheckbox(md: MarkdownIt) {
    let lastId: number = 0
    function createTokens(checked: boolean, label: string): Token[] {
        const nodes: Token[] = []

        const id = lastId
        lastId++

        let token = new Token('checkbox_input', 'input', 0)
        token.attrs = [['type', 'checkbox'], ['id', id.toString()], ['class', 'task-list-item-checkbox']]
        if (checked) {
            token.attrPush(['checked', 'true'])
        }
        nodes.push(token)

        token = new Token('label_open', 'label', 1)
        token.attrs = [['for', id.toString()]]
        nodes.push(token)

        token = new Token('text', '', 0)
        token.content = label
        nodes.push(token)

        nodes.push(new Token('label_close', 'label', -1))

        return nodes
    }

    function splitTextToken(token: Token): Token[] | null {
        let matches = token.content.match(/\[(X|\s|\_|\-)\]\s(.*)/i)
        if (matches === null) {
            return null
        }

        let checked = false
        const value: string = matches[1] || ''
        const label: string = matches[2] || ''
        if (value == 'X' || value == 'x') {
            checked = true
        }
        return createTokens(checked, label)
    }


    function checkbox(state: any): void {
        let blockTokens = state.tokens
        const l = blockTokens.length
        let k = -1
        for (let j = 0; j < l; j++) {
            //
            if (blockTokens[j].type === 'list_item_open') {
                k = j
            }
            if (blockTokens[j].type !== 'inline') {
                continue
            }
            let tokens = blockTokens[j].children
            for (let i = tokens.length - 1; i >= 0; i--) {
                const newTokens = splitTextToken(tokens[i])
                if (newTokens !== null) {
                    tokens = md.utils.arrayReplaceAt(tokens, i, newTokens)
                    blockTokens[j].children = tokens
                    if (k !== -1) {
                        blockTokens[k].attrs = [['class', 'task-list-item']]
                    }
                }
            }
        }
    }

    md.core.ruler.push('checkbox', checkbox)
}