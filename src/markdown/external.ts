import MarkdownIt, { Renderer, StateBlock } from "markdown-it"
import { MyToken } from "./token"

const webMap = new Map<string, string>([
  ['youtube', 'iframe'],
  ['vimeo', 'iframe'],
  ['gist', 'script'],
  ['slideshare', 'iframe'],
  ['speakerdeck', 'iframe'],
  ['pdf', 'embed'],
  ['figma', 'iframe'],
])

// modified from 
// https://github.com/markdown-it/markdown-it-container
export function MarkdownItExternal(md: MarkdownIt) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderer(tokens: MyToken[], idx: number, _options: MarkdownIt.Options, _env: any, slf: Renderer): string {
    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
      const meta = tokens[idx].meta as external
      tokens[idx].attrJoin('class', 'embed-' + meta.website)
      if (meta.website === 'youtube') {
        tokens[idx].attrJoin('src', 'https://www.youtube.com/embed/' + meta.url)
        tokens[idx].attrJoin('allowfullscreen', 'true')
        tokens[idx].attrJoin('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share')
        tokens[idx].attrJoin('frameborder', '0')
      } else if (meta.website === 'vimeo') {
        tokens[idx].attrJoin('src', 'https://player.vimeo.com/video/' + meta.url)
        tokens[idx].attrJoin('allowfullscreen', 'true')
        tokens[idx].attrJoin('frameborder', '0')
        tokens[idx].attrJoin('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share')
      } else if (meta.website === 'gist') {
        tokens[idx].attrJoin('src', 'https://gist.github.com/' + meta.url + '.js')
      } else if (meta.website === 'slideshare') {
        tokens[idx].attrJoin('src', 'https://www.slideshare.net/' + meta.url)
        tokens[idx].attrJoin('frameborder', '0')
        tokens[idx].attrJoin('marginwidth', '0')
        tokens[idx].attrJoin('marginheight', '0')
        tokens[idx].attrJoin('scrolling', 'no')
        tokens[idx].attrJoin('allowfullscreen', 'true')
      } else if (meta.website === 'speakerdeck') {
        tokens[idx].attrJoin('src', 'https://speakerdeck.com/' + meta.url)
      } else if (meta.website === 'pdf') {
        tokens[idx].attrJoin('src', meta.url)
        tokens[idx].attrJoin('type', 'application/pdf')
      } else if (meta.website === 'figma') {
        tokens[idx].attrJoin('src', 'https://www.figma.com/embed?embed_host=hackmd&url=' + meta.url)
        tokens[idx].attrJoin('allowfullscreen', 'true')
      }
    }

    return slf.renderToken(tokens, idx, _options)
  }

  const markerStart = '{%'
  const markerEnd = '%}'
  const markerStartChar = markerStart.charCodeAt(0)
  const markerLen = markerStart.length

  // parse

  // type 1
  // {%pdf https://www.w3.org/TR/WAI-WEBCONTENT/wai-pageauth.pdf %}

  // type 2
  // {%pdf https://www.w3.org/TR/WAI-WEBCONTENT/wai-pageauth.pdf 
  // %}

  // type 3
  // {%pdf 
  // https://www.w3.org/TR/WAI-WEBCONTENT/wai-pageauth.pdf 
  // %}

  interface external {
    website: string
    url: string
  }

  function rule(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    let pos, nextLine, token

    const start = state.bMarks[startLine]! + state.tShift[startLine]!
    const max = state.eMarks[startLine]!

    // Check out the first character quickly,
    // this should filter out most of non-containers
    if (markerStartChar !== state.src.charCodeAt(start)) {
      return false
    }

    // Check out the rest of the marker string
    for (pos = start + 1; pos <= max; pos++) {
      if (markerStart[(pos - start) % markerLen] !== state.src[pos]) {
        break
      }
    }

    pos -= (pos - start) % markerLen

    const params: string = state.src.slice(pos, max)
    const parse: string[] = params.trim().split(' ')
    const website: string = parse?.length > 0 ? (parse[0] || '') : ''
    let content = parse?.length > 1 ? parse[1] : ''

    if (!webMap.has(website)) {
      return false
    }

    // Since start is found, we can report success here in validation mode
    if (silent) {
      return true
    }

    // Search for the end of the block i.e., %}
    // from the current start line to the end of file
    let nextPos = 0;
    for (nextLine = startLine; nextLine < endLine; nextLine++) {
      // fetch `nextLine`
      const a = state.bMarks[nextLine]! + state.tShift[nextLine]!
      const b = state.eMarks[nextLine]
      const line = state.src.slice(a, b)
      // search from right to left
      nextPos = line.lastIndexOf(markerEnd)
      if (nextPos === -1) {
        if (nextLine !== startLine) {
          content += line
        }
        continue
      }
      break
    }

    token = state.push('external_open', webMap.get(website) ?? "", 1)
    token.meta = {
      website: website,
      url: content.trim(),
    }
    token.markup = markerStart
    token.block = true
    token.map = [startLine, nextLine]

    token = state.push('external_close', webMap.get(website) ?? "", -1)
    token.markup = markerEnd
    token.block = true

    // {%             -- startLine
    //   URL
    // %}             -- nextLine
    //   ^
    //   move state.bMarks[nextLine]
    if (nextPos !== -1) {
      state.bMarks[nextLine] += nextPos + 2
    }

    // state.line should be increased after parsing
    state.line = nextLine + 1
    return true
  }

  md.block.ruler.after('blockquote', 'external', rule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })

  md.renderer.rules.external_open = renderer
  md.renderer.rules.external_close = renderer
}
