// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import emojiRegex from 'emoji-regex';

import {autolinkAtMentions, highlightSearchTerms, handleUnicodeEmoji} from 'utils/text_formatting.jsx';
import {getEmojiMap} from 'selectors/emojis';
import store from 'stores/redux_store.jsx';

describe('autolinkAtMentions', () => {
    // testing to make sure @channel, @all & @here are setup properly to get highlighted correctly
    const mentionTestCases = [
        'channel',
        'all',
        'here',
    ];
    function runSuccessfulAtMentionTests(leadingText = '', trailingText = '') {
        mentionTestCases.forEach((testCase) => {
            const mention = `@${testCase}`;
            const text = `${leadingText}${mention}${trailingText}`;
            const tokens = new Map();

            const output = autolinkAtMentions(text, tokens);
            expect(output).toBe(`${leadingText}$MM_ATMENTION0$${trailingText}`);
            expect(tokens.get('$MM_ATMENTION0$').value).toBe(`<span data-mention="${testCase}">${mention}</span>`);
        });
    }
    function runUnsuccessfulAtMentionTests(leadingText = '', trailingText = '') {
        mentionTestCases.forEach((testCase) => {
            const mention = `@${testCase}`;
            const text = `${leadingText}${mention}${trailingText}`;
            const tokens = new Map();

            const output = autolinkAtMentions(text, tokens);
            expect(output).toBe(text);
            expect(tokens.get('$MM_ATMENTION0$')).toBeUndefined();
        });
    }

    // cases where highlights should be successful
    test('@channel, @all, @here should highlight properly with no leading or trailing content', () => {
        runSuccessfulAtMentionTests();
    });
    test('@channel, @all, @here should highlight properly with a leading space', () => {
        runSuccessfulAtMentionTests(' ', '');
    });
    test('@channel, @all, @here should highlight properly with a trailing space', () => {
        runSuccessfulAtMentionTests('', ' ');
    });
    test('@channel, @all, @here should highlight properly with a leading period', () => {
        runSuccessfulAtMentionTests('.', '');
    });
    test('@channel, @all, @here should highlight properly with a trailing period', () => {
        runSuccessfulAtMentionTests('', '.');
    });
    test('@channel, @all, @here should highlight properly with a leading dash', () => {
        runSuccessfulAtMentionTests('-', '');
    });
    test('@channel, @all, @here should highlight properly with a trailing dash', () => {
        runSuccessfulAtMentionTests('', '-');
    });
    test('@channel, @all, @here should highlight properly with a trailing underscore', () => {
        runSuccessfulAtMentionTests('', '_');
    });
    test('@channel, @all, @here should highlight when the first part of a word', () => {
        runSuccessfulAtMentionTests('', 'testing');
    });
    test('@channel, @all, @here should highlight properly within a typical sentance', () => {
        runSuccessfulAtMentionTests('This is a typical sentance, ', ' check out this sentance!');
    });

    // cases where highlights should be unseccessful
    test('@channel, @all, @here should not highlight with a leading underscore', () => {
        runUnsuccessfulAtMentionTests('_');
    });
    test('@channel, @all, @here should not highlight when the last part of a word', () => {
        runUnsuccessfulAtMentionTests('testing');
    });
    test('@channel, @all, @here should not highlight when in the middle of a word', () => {
        runUnsuccessfulAtMentionTests('test', 'ing');
    });
});

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