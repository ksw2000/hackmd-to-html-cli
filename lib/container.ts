// modified from https://github.com/markdown-it/markdown-it-container
import MarkdownIt from "markdown-it/lib"

const names = ['success', 'info', 'warning', 'danger', 'spoiler']
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MarkdownItContainer(md: MarkdownIt, _options: any) {
  // Second param may be useful if you decide
  // to increase minimal allowed marker length

  function renderContainer(tokens: any, idx: number, _options: any, env: any, slf: any): string {
    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
      tokens[idx].attrJoin('class', tokens[idx].name)
    }

    return slf.renderToken(tokens, idx, _options, env, slf)
  }

  function renderSpoiler(tokens: any, idx: number, _options: any, env: any, slf: any): string {
    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
      let summary: string = tokens[idx].summary
      const re = /\{state\s*=\s*"open"\}/
      if (summary.search(re) !== -1) {
        summary = summary.replace(re, '')
        tokens[idx].attrJoin('open', 'open')
      }
      return slf.renderToken(tokens, idx, _options, env, slf) + '\n<summary>' + summary + '</summary>'
    }

    return slf.renderToken(tokens, idx, _options, env, slf)
  }

  const minMarkers = 3
  const markerStr = ':'
  const markerChar = markerStr.charCodeAt(0)
  const markerLen = markerStr.length

  function rule(state: any, startLine: number, endLine: number, silent: any): boolean {
    let pos, nextLine, token

    let autoClosed = false
    let start = state.bMarks[startLine] + state.tShift[startLine]
    let max = state.eMarks[startLine]

    // Check out the first character quickly,
    // this should filter out most of non-containers
    if (markerChar !== state.src.charCodeAt(start)) {
      return false
    }

    // Check out the rest of the marker string
    for (pos = start + 1; pos <= max; pos++) {
      if (markerStr[(pos - start) % markerLen] !== state.src[pos]) {
        break
      }
    }

    const markerCount = Math.floor((pos - start) / markerLen)
    if (markerCount < minMarkers) {
      return false
    }

    pos -= (pos - start) % markerLen

    const markup = state.src.slice(start, pos)
    const params: string = state.src.slice(pos, max)

    const parse: string[] = params.trim().split(' ')
    const name: string = parse?.length > 0 ? (parse[0] || '') : ''
    const summary: string = parse.length > 1 ? parse.slice(1).join(' ') : ''
    if (!names.includes(name)) {
      return false
    }

    // Since start is found, we can report success here in validation mode
    if (silent) {
      return true
    }

    // Search for the end of the block
    nextLine = startLine

    for (; ;) {
      nextLine++
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine]
      max = state.eMarks[nextLine]

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break
      }

      if (markerChar !== state.src.charCodeAt(start)) {
        continue
      }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue
      }

      for (pos = start + 1; pos <= max; pos++) {
        if (markerStr[(pos - start) % markerLen] !== state.src[pos]) {
          break
        }
      }

      // closing code fence must be at least as long as the opening one
      if (Math.floor((pos - start) / markerLen) < markerCount) {
        continue
      }

      // make sure tail has spaces only
      pos -= (pos - start) % markerLen
      pos = state.skipSpaces(pos)

      if (pos < max) {
        continue
      }

      // found!
      autoClosed = true
      break
    }

    const oldParent = state.parentType
    const oldLineMax = state.lineMax
    state.parentType = 'container'

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine

    // if (name === 'spoiler') {
    token = state.push(name === 'spoiler' ? 'spoiler_open' : 'container_open', name === 'spoiler' ? 'details' : 'div', 1)
    token.summary = summary
    token.name = name
    token.markup = markup
    token.block = true
    // token.info = params
    token.map = [startLine, nextLine]

    state.md.block.tokenize(state, startLine + 1, nextLine)

    token = state.push(name === 'spoiler' ? 'spoiler_close' : 'container_close', name === 'spoiler' ? 'details' : 'div', -1)
    token.markup = state.src.slice(start, pos)
    token.block = true

    state.parentType = oldParent
    state.lineMax = oldLineMax
    state.line = nextLine + (autoClosed ? 1 : 0)

    return true
  }

  md.block.ruler.before('fence', 'container', rule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })
  md.renderer.rules.container_open = renderContainer
  md.renderer.rules.container_close = renderContainer
  md.renderer.rules.spoiler_open = renderSpoiler
  md.renderer.rules.spoiler_close = renderSpoiler
}
