import YAML from 'yaml'
import MarkdownIt from "markdown-it/lib"

// modified from https://github.com/flaviotordini/markdown-it-yaml
const tokenType = 'yaml_metadata'

export class Metadata{
  title: string = ""
  description: string =""
  lang: string = ""
  robots: string = ""
  dir: string = ""
  image: string = ""
}

export function MarkdownItYAMLMetadata(md: MarkdownIt, callback: (metadata: Metadata) => any) {
  function getLine(state: any, line: any): string {
    const pos = state.bMarks[line]
    const max = state.eMarks[line]
    return state.src.substring(pos, max)
  }

  function rule(state: any, startLine: number, endLine: number, silent: any): boolean {
    if (state.blkIndent !== 0 || state.tShift[startLine] < 0) {
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
    token.yaml = state.src.substring(dataStartPos, dataEndPos)

    state.line = nextLine + 1
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function renderer(tokens: any, idx: number, _options: any, _evn: any): string {
    const token = tokens[idx]
    if (callback) {
      let data = YAML.parse(token.yaml)
      let metadata = new Metadata()
      metadata.title = data.title ?? ''
      metadata.lang = data.lang ?? ''
      metadata.robots = data.robots ?? ''
      metadata.description = data.description ?? ''
      metadata.dir = data.dir ?? ''
      metadata.image = data.image ?? ''
      callback(metadata)
    }
    return `<!--yaml\n${token.yaml}\n-->`
  }

  md.block.ruler.before('hr', tokenType, rule)
  md.renderer.rules[tokenType] = renderer
}
