// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {formatMarkdownTableMessage} from './tables';

function parseTable(html: string): HTMLTableElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild as HTMLTableElement;
}

const validTable: HTMLTableElement = parseTable('<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>');

describe('Paste.formatMarkdownTableMessage', () => {
    const markdownTable = '|test | test|\n|--- | ---|\n|test | test|\n';

    test('returns a markdown table when valid html table provided', () => {
        expect(formatMarkdownTableMessage(validTable)).toBe(markdownTable);
    });
});
