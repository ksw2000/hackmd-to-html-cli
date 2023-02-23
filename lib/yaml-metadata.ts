import YAML from 'yaml'

// modified from https://github.com/flaviotordini/markdown-it-yaml
const tokenType = 'yaml_metadata'

export function MarkdownItYAMLMetadata(md: any, callback: undefined | ((option: any) => any)) {
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

  function renderer(tokens: any, idx: number, _options: any, _evn: any): string {
    const token = tokens[idx]
    if (callback) {
      callback(YAML.parse(token.yaml))
    }
    return `<!--yaml\n${token.yaml}\n-->`
  }

  md.block.ruler.before('hr', tokenType, rule)
  md.renderer.rules[tokenType] = renderer
}
