// Because markdown-it does not export the Token class,
// we can implement the class ourselves.
// token.ts was modified from
// https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/token.mjs#L12

import { Token } from "markdown-it";

export class MyToken implements Token {
    /**
     * Type of the token (string, e.g. "paragraph_open")
     */
    type: string;

    /**
     * html tag name, e.g. "p"
     */
    tag: string;

    /**
     * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
     */
    attrs: Array<[string, string]> | null;

    /**
     * Source map info. Format: `[ line_begin, line_end ]`
     */
    map: [number, number] | null;

    /**
     * Level change (number in {-1, 0, 1} set), where:
     * - `1` means the tag is opening
     * - `0` means the tag is self-closing
     * - `-1` means the tag is closing
     */
    nesting: 1 | 0 | -1;

    /**
     * Nesting level, the same as `state.level`
     */
    level: number;

    /**
     * An array of child nodes (inline and img tokens)
     */
    children: Token[] | null;

    /**
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     */
    content: string;

    /**
     * '*' or '_' for emphasis, fence string for fence, etc.
     */
    markup: string;

    /**
     * Additional information:
     * - Info string for "fence" tokens
     * - The value "auto" for autolink "link_open" and "link_close" tokens
     * - The string value of the item marker for ordered-list "list_item_open" tokens
     */
    info: string;

    /**
     * A place for plugins to store arbitrary data
     */
    meta: object | null;

    /**
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks.
     */
    block: boolean;

    /**
     * If true, ignore this element when rendering. Used for tight lists to hide paragraphs.
     */
    hidden: boolean;

    constructor(type: string, tag: string, nesting: 0 | 1 | -1) {
        this.type = type;
        this.tag = tag;
        this.attrs = null;
        this.map = null;
        this.nesting = nesting;
        this.level = 0;
        this.children = null;
        this.content = '';
        this.markup = '';
        this.info = '';
        this.meta = null;
        this.block = false;
        this.hidden = false;
    }
    attrIndex(name: string): number {
        if (!this.attrs) { return -1 }

        const attrs = this.attrs

        for (let i = 0, len = attrs.length; i < len; i++) {
            if (attrs[i][0] === name) { return i }
        }
        return -1
    }
    attrPush(attrData: [string, string]): void {
        if (this.attrs) {
            this.attrs.push(attrData)
        } else {
            this.attrs = [attrData]
        }
    }
    attrSet(name: string, value: string): void {
        const idx = this.attrIndex(name)
        const attrData: [string, string] = [name, value]

        if (idx < 0) {
            this.attrPush(attrData)
        } else {
            this.attrs![idx] = attrData
        }
    }
    attrGet(name: string): string | null {
        const idx = this.attrIndex(name)
        let value = null
        if (idx >= 0) {
            value = this.attrs![idx][1]
        }
        return value
    }
    attrJoin(name: string, value: string): void {
        const idx = this.attrIndex(name)

        if (idx < 0) {
            this.attrPush([name, value])
        } else {
            this.attrs![idx][1] = this.attrs![idx][1] + ' ' + value
        }
    }
}