import { test, expect } from '@jest/globals'
import MarkdownIt from 'markdown-it'
import { MarkdownItYAMLMetadata, Metadata } from './yamlMetadata';

test('test the externals plugin', () => {
    let metadata: Metadata = {
        title: '',
        description: '',
        lang: '',
        robots: '',
        dir: '',
        image: ''
    };
    const converter = new MarkdownIt().use(MarkdownItYAMLMetadata, (_metadata: Metadata) => {
        metadata = _metadata;
    })

    const expectedMetaData = {
        title: 'Example of hackmd-to-html-cli',
        lang: 'zh-TW',
        robots: 'noindex',
        description: 'An example of using hackmd-to-html-cli',
        dir: 'ltr',
        image: ''
    }

    const tests = [
        `---
title: Example of hackmd-to-html-cli
lang: zh-TW
description: An example of using hackmd-to-html-cli
robots: noindex
dir: ltr
tags: hack
---
        `,
    ]
    const res = converter.render(tests[0]);
    expect(res).toMatch(/^<!--yaml/)
    expect(res).toMatch(/-->$/)
    expect(metadata).toEqual(expectedMetaData)
})