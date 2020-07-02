// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {parseTable, getTable, formatMarkdownTableMessage} from './tables';

const validTable: HTMLTableElement = parseTable('<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>') as HTMLTableElement;

describe('Paste.getTable', () => {
    test('returns false with empty html', () => {
        expect(getTable('')).toBe(null);
    });

    test('returns false without table', () => {
        expect(getTable('<p>There is no table here</p>')).toBe(null);
    });

    test('returns table from valid clipboard data', () => {
        expect(getTable('<table><tr><td>test</td><td>test</td></tr><tr><td>test</td><td>test</td></tr></table>')).toEqual(validTable);
    });
});

describe('Paste.formatMarkdownTableMessage', () => {
    const markdownTable = '|test | test|\n|--- | ---|\n|test | test|\n';

    test('returns a markdown table when valid html table provided', () => {
        expect(formatMarkdownTableMessage(validTable)).toBe(markdownTable);
    });
});
