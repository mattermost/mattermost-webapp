// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as TextFormatting from 'utils/text_formatting.jsx';

describe('TextFormatting Wildcard Prefixes', () => {
    it('finds words with various last characters', () => {
        assertTextMatch('foobar', 'foo*', 'foo', 'bar');
        assertTextMatch('foo1bar', 'foo1*', 'foo1', 'bar');
        assertTextMatch('foo_bar', 'foo_*', 'foo_', 'bar');
        assertTextMatch('foo.bar', 'foo.*', 'foo.', 'bar');
        assertTextMatch('foo?bar', 'foo?*', 'foo?', 'bar');
        assertTextMatch('foo bar', 'foo*', 'foo', ' bar');
        assertTextMatch('foo bar', 'foo *', 'foo', ' bar');
        assertTextMatch('foo⺑bar', 'foo⺑*', 'foo⺑', ' bar');
    });
});

function assertTextMatch(input, search, expectedMatch, afterMatch) {
    assert.equal(
        TextFormatting.formatText(input, {searchTerm: search}).trim(),
        `<p><span class='search-highlight'>${expectedMatch}</span>${afterMatch}</p>`,
    );
}