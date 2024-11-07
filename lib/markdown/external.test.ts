import { test, expect } from '@jest/globals'
import MarkdownIt from 'markdown-it'
import { MarkdownItExternal } from './external';

test('test the externals plugin', () => {
    const converter = new MarkdownIt().use(MarkdownItExternal)
    const tests = [
        `{%youtube oCgdmlee5vQ %}`,
        `{%youtube oCgdmlee5vQ 
        %}`,
        `{%youtube 
oCgdmlee5vQ  
%}`,
    ]
    const expected = [
        /^<iframe class="embed-youtube"/,
        /^<iframe class="embed-youtube"/,
        /^<iframe class="embed-youtube"/
    ]
    for (let i = 0; i < test.length; i++) {
        const res = converter.render(tests[i]);
        expect(res).toMatch(expected[i])
    }
})