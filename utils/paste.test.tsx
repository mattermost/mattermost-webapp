// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {parseTable, getTable, formatMarkdownTableMessage, formatGithubCodePaste} from './paste';

const validClipboardData: any = {
    items: [1],
    types: ['text/html'],
    getData: () => {
        return '<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>';
    },
};

const validTable: any = parseTable(validClipboardData.getData());

describe('Paste.getTable', () => {
    test('returns false without html in the clipboard', () => {
        const badClipboardData: any = {
            items: [1],
            types: ['text/plain'],
        };

        expect(getTable(badClipboardData)).toBe(false);
    });

    test('returns false without table in the clipboard', () => {
        const badClipboardData: any = {
            items: [1],
            types: ['text/html'],
            getData: () => '<p>There is no table here</p>',
        };

        expect(getTable(badClipboardData)).toBe(false);
    });

    test('returns table from valid clipboard data', () => {
        expect(getTable(validClipboardData)).toEqual(validTable);
    });
});

describe('Paste.formatMarkdownTableMessage', () => {
    const markdownTable = '|test | test|\n|--- | ---|\n|test | test|\n';

    test('returns a markdown table when valid html table provided', () => {
        expect(formatMarkdownTableMessage(validTable)).toBe(markdownTable);
    });

    test('returns a markdown table under a message when one is provided', () => {
        const testMessage = 'test message';

        expect(formatMarkdownTableMessage(validTable, testMessage)).toBe(`${testMessage}\n\n${markdownTable}`);
    });
});

describe('Paste.formatGithubCodePaste', () => {
    const clipboardData: any = {
        items: [],
        types: ['text/plain', 'text/html'],
        getData: (type: any) => {
            if (type === 'text/plain') {
                return '// a javascript codeblock example\nif (1 > 0) {\n  return \'condition is true\';\n}';
            }
            return '<table class="highlight tab-size js-file-line-container" data-tab-size="8"><tbody><tr><td id="LC1" class="blob-code blob-code-inner js-file-line"><span class="pl-c"><span class="pl-c">//</span> a javascript codeblock example</span></td></tr><tr><td id="L2" class="blob-num js-line-number" data-line-number="2">&nbsp;</td><td id="LC2" class="blob-code blob-code-inner js-file-line"><span class="pl-k">if</span> (<span class="pl-c1">1</span> <span class="pl-k">&gt;</span> <span class="pl-c1">0</span>) {</td></tr><tr><td id="L3" class="blob-num js-line-number" data-line-number="3">&nbsp;</td><td id="LC3" class="blob-code blob-code-inner js-file-line"><span class="pl-en">console</span>.<span class="pl-c1">log</span>(<span class="pl-s"><span class="pl-pds">\'</span>condition is true<span class="pl-pds">\'</span></span>);</td></tr><tr><td id="L4" class="blob-num js-line-number" data-line-number="4">&nbsp;</td><td id="LC4" class="blob-code blob-code-inner js-file-line">}</td></tr></tbody></table>';
        },
    };

    test('Formatted message for empty message', () => {
        const message = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";
        const codeBlock = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(0, '', clipboardData);
        expect(message).toBe(message);
        expect(codeBlock).toBe(codeBlock);
    });

    test('Formatted message with a draft and cursor at end', () => {
        const message = "test\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";
        const codeBlock = "\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(4, 'test', clipboardData);
        expect(message).toBe(message);
        expect(codeBlock).toBe(codeBlock);
    });

    test('Formatted message with a draft and cursor at start', () => {
        const message = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\ntest";
        const codeBlock = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\n";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(0, 'test', clipboardData);
        expect(message).toBe(message);
        expect(codeBlock).toBe(codeBlock);
    });

    test('Formatted message with a draft and cursor at middle', () => {
        const message = "te\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\nst";
        const codeBlock = "\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\n";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(2, 'test', clipboardData);
        expect(message).toBe(message);
        expect(codeBlock).toBe(codeBlock);
    });
});
