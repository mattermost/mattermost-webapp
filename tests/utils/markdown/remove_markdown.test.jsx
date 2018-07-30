// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {formatWithRenderer} from 'utils/markdown';
import RemoveMarkdown from 'utils/markdown/remove_markdown';
const removeMarkdown = new RemoveMarkdown();

describe('RemoveMarkdown', () => {
    const testCases = [
        {
            description: 'emoji: same',
            inputText: 'Hey :smile: :+1: :)',
            outputText: 'Hey :smile: :+1: :)',
        },
        {
            description: 'at-mention: same',
            inputText: 'Hey @user and @test',
            outputText: 'Hey @user and @test',
        },
        {
            description: 'channel-link: same',
            inputText: 'join ~channelname',
            outputText: 'join ~channelname',
        },
        {
            description: 'codespan: single backtick',
            inputText: '`single backtick`',
            outputText: 'single backtick',
        },
        {
            description: 'codespan: double backtick',
            inputText: '``double backtick``',
            outputText: 'double backtick',
        },
        {
            description: 'codespan: triple backtick',
            inputText: '```triple backtick```',
            outputText: 'triple backtick',
        },
        {
            description: 'codespan: inline code',
            inputText: 'Inline `code` has ``double backtick`` and ```triple backtick``` around it.',
            outputText: 'Inline code has double backtick and triple backtick around it.',
        },
        {
            description: 'codespan: multiline codespan',
            inputText: 'Multiline ```\ncodespan\n```',
            outputText: 'Multiline codespan',
        },
        {
            description: 'codespan: language highlighting',
            inputText: '```javascript\nvar s = "JavaScript syntax highlighting";\nalert(s);\n```',
            outputText: ' var s = "JavaScript syntax highlighting"; alert(s); ',
        },
        {
            description: 'blockquote:',
            inputText: '> Hey quote',
            outputText: 'Hey quote',
        },
        {
            description: 'blockquote: multiline',
            inputText: '> Hey quote.\n> Hello quote.',
            outputText: 'Hey quote. Hello quote.',
        },
        {
            description: 'heading: # H1 header',
            inputText: '# H1 header',
            outputText: 'H1 header',
        },
        {
            description: 'heading: heading with @user',
            inputText: '# H1 @user',
            outputText: 'H1 @user',
        },
        {
            description: 'heading: ## H2 header',
            inputText: '## H2 header',
            outputText: 'H2 header',
        },
        {
            description: 'heading: ### H3 header',
            inputText: '### H3 header',
            outputText: 'H3 header',
        },
        {
            description: 'heading: #### H4 header',
            inputText: '#### H4 header',
            outputText: 'H4 header',
        },
        {
            description: 'heading: ##### H5 header',
            inputText: '##### H5 header',
            outputText: 'H5 header',
        },
        {
            description: 'heading: ###### H6 header',
            inputText: '###### H6 header',
            outputText: 'H6 header',
        },
        {
            description: 'list: 1. First ordered list item',
            inputText: '1. First ordered list item',
            outputText: 'First ordered list item',
        },
        {
            description: 'list: 2. Another item',
            inputText: '1. 2. Another item',
            outputText: 'Another item',
        },
        {
            description: 'list: * Unordered sub-list.',
            inputText: '* Unordered sub-list.',
            outputText: 'Unordered sub-list.',
        },
        {
            description: 'list: - Or minuses',
            inputText: '- Or minuses',
            outputText: 'Or minuses',
        },
        {
            description: 'list: + Or pluses',
            inputText: '+ Or pluses',
            outputText: 'Or pluses',
        },
        {
            description: 'list: multiline',
            inputText: '1. First ordered list item\n2. Another item',
            outputText: 'First ordered list itemAnother item',
        },
        {
            description: 'tablerow:)',
            inputText: 'Markdown | Less | Pretty\n' +
            '--- | --- | ---\n' +
            '*Still* | `renders` | **nicely**\n' +
            '1 | 2 | 3\n',
            outputText: '',
        },
        {
            description: 'table:',
            inputText: '| Tables        | Are           | Cool  |\n' +
                '| ------------- |:-------------:| -----:|\n' +
                '| col 3 is      | right-aligned | $1600 |\n' +
                '| col 2 is      | centered      |   $12 |\n' +
                '| zebra stripes | are neat      |    $1 |\n',
            outputText: '',
        },
        {
            description: 'strong: Bold with **asterisks** or __underscores__.',
            inputText: 'Bold with **asterisks** or __underscores__.',
            outputText: 'Bold with asterisks or underscores.',
        },
        {
            description: 'strong & em: Bold and italics with **asterisks and _underscores_**.',
            inputText: 'Bold and italics with **asterisks and _underscores_**.',
            outputText: 'Bold and italics with asterisks and underscores.',
        },
        {
            description: 'em: Italics with *asterisks* or _underscores_.',
            inputText: 'Italics with *asterisks* or _underscores_.',
            outputText: 'Italics with asterisks or underscores.',
        },
        {
            description: 'del: Strikethrough ~~strike this.~~',
            inputText: 'Strikethrough ~~strike this.~~',
            outputText: 'Strikethrough strike this.',
        },
        {
            description: 'links: [inline-style link](http://localhost:8065)',
            inputText: '[inline-style link](http://localhost:8065)',
            outputText: 'inline-style link',
        },
        {
            description: 'image: ![image link](http://localhost:8065/image)',
            inputText: '![image link](http://localhost:8065/image)',
            outputText: 'image link',
        },
        {
            description: 'text: plain',
            inputText: 'This is plain text.',
            outputText: 'This is plain text.',
        },
        {
            description: 'text: multiline',
            inputText: 'This is multiline text.\nHere is the next line.\n',
            outputText: 'This is multiline text. Here is the next line.',
        },
    ];

    testCases.forEach((testCase) => it(testCase.description, () => {
        expect(formatWithRenderer(testCase.inputText, removeMarkdown)).toEqual(testCase.outputText);
    }));
});