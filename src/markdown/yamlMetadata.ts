import YAML from 'yaml'
import MarkdownIt, { Token, StateBlock } from "markdown-it"

// modified from 
// https://github.com/flaviotordini/markdown-it-yaml

const tokenType = 'yaml_metadata'

export interface Metadata {
    title: string;
    description: string;
    lang: string;
    robots: string;
    dir: string;
    image: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MarkdownItYAMLMetadata(md: MarkdownIt, callback: (metadata: Metadata) => any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getLine(state: any, line: any): string {
        const pos = state.bMarks[line]
        const max = state.eMarks[line]
        return state.src.substring(pos, max)
    }

    function rule(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
        if (state.blkIndent !== 0 || state.tShift[startLine]! < 0) {
            return false
        }
        if (startLine !== 0) {
            return false
        }

        if (getLine(state, startLine) !== '---') {
            return false
        }

        if (silent) return true

        let nextLine = startLine + 1
        const dataStart = nextLine
        let dataEnd = dataStart
        while (nextLine < endLine) {
            if (state.tShift[nextLine] < 0) {
                break
            }
            if (getLine(state, nextLine) === '---') {
                break
            }
            dataEnd = nextLine
            nextLine++
        }

        const dataStartPos = state.bMarks[dataStart]
        const dataEndPos = state.eMarks[dataEnd]

        const token = state.push(tokenType, '', 0)
        token.content = state.src.substring(dataStartPos, dataEndPos)

        state.line = nextLine + 1
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    function renderer(tokens: Token[], idx: number, _options: MarkdownIt.Options, _evn: any): string {
        const token = tokens[idx]
        if (callback) {
            const data = YAML.parse(token.content)
            callback({
                title: data.title ?? '',
                lang: data.lang ?? '',
                robots: data.robots ?? '',
                description: data.description ?? '',
                dir: data.dir ?? '',
                image: data.image ?? ''
            })
        }
        return `<!--yaml\n${token.content}\n-->`
    }

    md.block.ruler.before('hr', tokenType, rule)
    md.renderer.rules[tokenType] = renderer
}
