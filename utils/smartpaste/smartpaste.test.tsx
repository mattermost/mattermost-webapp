// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import smartPaste from './smartpaste';

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
        const expectedMessage = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";
        const expectedCaretPosition = expectedMessage.length;

        const result = smartPaste(clipboardData, '', 0, {html: true, code: false});
        expect(result.message).toBe(expectedMessage);
        expect(result.caretPosition).toBe(expectedCaretPosition);
    });

    test('Formatted message with a draft and cursor at end', () => {
        const expectedMessage = "test\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";
        const expectedCaretPosition = expectedMessage.length;

        const result = smartPaste(clipboardData, 'test', 4, {html: true, code: false});
        expect(result.message).toBe(expectedMessage);
        expect(result.caretPosition).toBe(expectedCaretPosition);
    });

    test('Formatted message with a draft and cursor at start', () => {
        const expectedMessage = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\ntest";
        const expectedCaretPosition = expectedMessage.length - 4;

        const result = smartPaste(clipboardData, 'test', 0, {html: true, code: false});
        expect(result.message).toBe(expectedMessage);
        expect(result.caretPosition).toBe(expectedCaretPosition);
    });

    test('Formatted message with a draft and cursor at middle', () => {
        const expectedMessage = "te\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\nst";
        const expectedCaretPosition = expectedMessage.length - 2;

        const result = smartPaste(clipboardData, 'test', 2, {html: true, code: false});
        expect(result.message).toBe(expectedMessage);
        expect(result.caretPosition).toBe(expectedCaretPosition);
    });
});
