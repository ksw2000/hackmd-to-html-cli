// modified from:
// https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/common/utils.mjs

const HTML_ESCAPE_TEST_RE = /[&<>"]/
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g
const HTML_UNESCAPE_TEST_RE = /&(?:amp|lt|gt|quot|#39|#34);/;
const HTML_UNESCAPE_REPLACE_RE = /&(?:amp|lt|gt|quot|#39|#34);/g;

function replaceUnsafeChar(ch: string): string {
    switch (ch) {
        case '&':
            return '&amp;'
        case '<':
            return '&lt;'
        case '>':
            return '&gt;'
        case '"':
            return '&quot;'
    }
    return ""
}


function replaceEscapedChar(entity: string): string {
    switch (entity) {
      case "&amp;":
        return "&";
      case "&lt;":
        return "<";
      case "&gt;":
        return ">";
      case "&quot;":
        return '"';
      case "&#39;":
        return "'";
      case "&#34;":
        return '"';
    }
    return "";
  }

export function escapeHtml(str: string): string {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
    }
    return str
}

export function reverseEscapeHtml(str: string): string {
    if (HTML_UNESCAPE_TEST_RE.test(str)) {
      return str.replace(HTML_UNESCAPE_REPLACE_RE, replaceEscapedChar);
    }
    return str;
  }  