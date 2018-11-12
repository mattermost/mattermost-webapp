// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {highlightSearchTerms} from 'utils/text_formatting.jsx';

describe('highlightSearchTerms', () => {
    test('hashtags should highlight case-insensitively', () => {
        const text = '$MM_HASHTAG0$';
        const tokens = new Map(
            [['$MM_HASHTAG0$', {
                hashtag: 'Test',
                originalText: '#Test',
                value: '<a class="mention-link" href="#" data-hashtag="#Test">#Test</a>',
            }]],
        );
        const searchPatterns = [
            {
                pattern: /(\W|^)(#test)\b/gi,
                term: '#test',
            },
        ];

        const output = highlightSearchTerms(text, tokens, searchPatterns);
        expect(output).toBe('$MM_SEARCHTERM1$');
        expect(tokens.get('$MM_SEARCHTERM1$').value).toBe('<span class="search-highlight">$MM_HASHTAG0$</span>');
    });
});
