// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import emojiRegex from 'emoji-regex';

import {highlightSearchTerms, handleUnicodeEmoji} from 'utils/text_formatting.jsx';
import {getEmojiMap} from 'selectors/emojis';
import store from 'stores/redux_store.jsx';

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

describe('handleUnicodeEmoji', () => {
    test('unicode emoji with image support should get replaced with an image', () => {
        const text = '👍';
        const emojiMap = getEmojiMap(store.getState());
        const UNICODE_EMOJI_REGEX = emojiRegex();

        const output = handleUnicodeEmoji(text, emojiMap, UNICODE_EMOJI_REGEX);
        expect(output).toBe('<img class="emoticon" draggable="false" alt="👍" src="/static/emoji/1f44d.png">');
    });
    test('unicode emoji without image support should get wrapped in a span tag', () => {
        const text = '🤟'; // note, this test will fail as soon as this emoji gets a corresponding image
        const emojiMap = getEmojiMap(store.getState());
        const UNICODE_EMOJI_REGEX = emojiRegex();

        const output = handleUnicodeEmoji(text, emojiMap, UNICODE_EMOJI_REGEX);
        expect(output).toBe('<span class="emoticon emoticon--unicode">🤟</span>');
    });
});