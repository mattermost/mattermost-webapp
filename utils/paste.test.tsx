// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {parseHtmlTable, getHtmlTable, formatMarkdownMessage, formatGithubCodePaste, formatMarkdownLinkMessage, isTextUrl} from './paste';

const validClipboardData: any = {
    items: [1],
    types: ['text/html'],
    getData: () => {
        return '<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>';
    },
};

const validTable: any = parseHtmlTable(validClipboardData.getData());

describe('getHtmlTable', () => {
    test('returns false without html in the clipboard', () => {
        const badClipboardData: any = {
            items: [1],
            types: ['text/plain'],
        };

        expect(getHtmlTable(badClipboardData)).toBe(null);
    });

    test('returns false without table in the clipboard', () => {
        const badClipboardData: any = {
            items: [1],
            types: ['text/html'],
            getData: () => '<p>There is no table here</p>',
        };

        expect(getHtmlTable(badClipboardData)).toBe(null);
    });

    test('returns table from valid clipboard data', () => {
        expect(getHtmlTable(validClipboardData)).toEqual(validTable);
    });
});

describe('formatMarkdownMessage', () => {
    const markdownTable = '| test | test |\n| --- | --- |\n| test | test |';

    test('returns a markdown table when valid html table provided', () => {
        expect(formatMarkdownMessage(validClipboardData).formattedMessage).toBe(`${markdownTable}\n`);
    });

    test('returns a markdown table when valid html table with headers provided', () => {
        const tableHeadersClipboardData: any = {
            items: [1],
            types: ['text/html'],
            getData: () => {
                return '<table><tr><th>test</th><th>test</th></tr><tr><td>test</td><td>test</td></tr></table>';
            },
        };

        expect(formatMarkdownMessage(tableHeadersClipboardData).formattedMessage).toBe(markdownTable);
    });

    test('removes style contents and additional whitespace around tables', () => {
        const styleClipboardData: any = {
            items: [1],
            types: ['text/html'],
            getData: () => {
                return '<style><!--td {border: 1px solid #cccccc;}--></style>\n<table><tr><th>test</th><th>test</th></tr><tr><td>test</td><td>test</td></tr></table>\n';
            },
        };

        expect(formatMarkdownMessage(styleClipboardData).formattedMessage).toBe(markdownTable);
    });

    test('returns a markdown table under a message when one is provided', () => {
        const testMessage = 'test message';

        expect(formatMarkdownMessage(validClipboardData, testMessage).formattedMessage).toBe(`${testMessage}\n\n${markdownTable}\n`);
    });

    test('returns a markdown formatted link when valid hyperlink provided', () => {
        const linkClipboardData: any = {
            items: [1],
            types: ['text/html'],
            getData: () => {
                return '<a href="https://test.domain">link text</a>';
            },
        };
        const markdownLink = '[link text](https://test.domain)';

        expect(formatMarkdownMessage(linkClipboardData).formattedMessage).toBe(markdownLink);
    });
});

describe('formatGithubCodePaste', () => {
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

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste({selectionStart: 0, selectionEnd: 0, message: '', clipboardData});
        expect(message).toBe(formattedMessage);
        expect(codeBlock).toBe(formattedCodeBlock);
    });

    test('Formatted message with a draft and cursor at end', () => {
        const message = "test\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";
        const codeBlock = "\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste({selectionStart: 4, selectionEnd: 4, message: 'test', clipboardData});
        expect(message).toBe(formattedMessage);
        expect(codeBlock).toBe(formattedCodeBlock);
    });

    test('Formatted message with a draft and cursor at start', () => {
        const message = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\ntest";
        const codeBlock = "```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\n";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste({selectionStart: 0, selectionEnd: 0, message: 'test', clipboardData});
        expect(message).toBe(formattedMessage);
        expect(codeBlock).toBe(formattedCodeBlock);
    });

    test('Formatted message with a draft and cursor at middle', () => {
        const message = "te\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\nst";
        const codeBlock = "\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\n";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste({selectionStart: 2, selectionEnd: 2, message: 'test', clipboardData});
        expect(message).toBe(formattedMessage);
        expect(codeBlock).toBe(formattedCodeBlock);
    });

    test('Selected message in the middle is replaced with code', () => {
        const originalMessage = 'test replace message';
        const codeBlock = "\n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\n";
        const updatedMessage = "test \n```\n// a javascript codeblock example\nif (1 > 0) {\n  return 'condition is true';\n}\n```\n message";

        const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste({selectionStart: 5, selectionEnd: 12, message: originalMessage, clipboardData});
        expect(updatedMessage).toBe(formattedMessage);
        expect(codeBlock).toBe(formattedCodeBlock);
    });
});

describe('formatMarkdownLinkMessage', () => {
    const clipboardData: any = {
        items: [],
        types: ['text/plain'],
        getData: () => {
            return 'https://example.com/';
        },
    };

    test('Should return empty selection when no selection is made', () => {
        const message = '';

        const formatttedMarkdownLinkMessage = formatMarkdownLinkMessage({selectionStart: 0, selectionEnd: 0, message, clipboardData});
        expect(formatttedMarkdownLinkMessage).toEqual('[](https://example.com/)');
    });

    test('Should return correct selection when selection is made', () => {
        const message = 'test';

        const formatttedMarkdownLinkMessage = formatMarkdownLinkMessage({selectionStart: 0, selectionEnd: 4, message, clipboardData});
        expect(formatttedMarkdownLinkMessage).toEqual('[test](https://example.com/)');
    });

    test('Should not add link when pasting inside of a formatted markdown link', () => {
        const message = '[test](url)';
        const formatttedMarkdownLinkMessage = formatMarkdownLinkMessage({selectionStart: 7, selectionEnd: 10, message, clipboardData});
        expect(formatttedMarkdownLinkMessage).toEqual('https://example.com/');
    });

    test('Should add link when pasting inside of an improper formatted markdown link', () => {
        const improperFormattedLinkMessages = [
            {message: '[test](url)', selection: 'ur', expected: '[ur](https://example.com/)'},
            {message: '[test](url)', selection: '(url', expected: '[(url](https://example.com/)'},
            {message: '[test](url)', selection: 'url)', expected: '[url)](https://example.com/)'},
            {message: '[test](url)', selection: '(url)', expected: '[(url)](https://example.com/)'},
            {message: '[test](url)', selection: '[test](url', expected: '[[test](url](https://example.com/)'},
            {message: '[test](url)', selection: 'test](url', expected: '[test](url](https://example.com/)'},
            {message: '[test](url)', selection: 'test](url)', expected: '[test](url)](https://example.com/)'},
            {message: '[test](url)', selection: '[test](url)', expected: '[[test](url)](https://example.com/)'},
        ];

        for (const {message, selection, expected} of improperFormattedLinkMessages) {
            const selectionStart = message.indexOf(selection);
            const selectionEnd = selectionStart + selection.length;

            const formatttedMarkdownLinkMessage = formatMarkdownLinkMessage({selectionStart, selectionEnd, message, clipboardData});
            expect(formatttedMarkdownLinkMessage).toEqual(expected);
        }
    });
});

describe('isTextUrl', () => {
    test('Should return true when url is valid', () => {
        const clipboardData: any = {
            ...validClipboardData,
            getData: () => {
                return 'https://example.com/';
            },
        };
        expect(isTextUrl(clipboardData)).toBe(true);
    });

    test('Should return false when url is invalid', () => {
        const clipboardData: any = {
            ...validClipboardData,
            getData: () => {
                return 'not a url';
            },
        };

        expect(isTextUrl(clipboardData)).toBe(false);
    });
});
