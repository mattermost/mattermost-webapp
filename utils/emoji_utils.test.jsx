// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {compareEmojis, wrapEmojis} from './emoji_utils';

describe('compareEmojis', () => {
    test('should sort an array of emojis alphabetically', () => {
        const goatEmoji = {
            name: 'goat',
        };

        const dashEmoji = {
            name: 'dash',
        };

        const smileEmoji = {
            name: 'smile',
        };

        const emojiArray = [goatEmoji, dashEmoji, smileEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b));

        expect(emojiArray).toEqual([dashEmoji, goatEmoji, smileEmoji]);
    });

    test('should have partiall matched emoji first', () => {
        const goatEmoji = {
            name: 'goat',
        };

        const dashEmoji = {
            name: 'dash',
        };

        const smileEmoji = {
            name: 'smile',
        };

        const emojiArray = [goatEmoji, dashEmoji, smileEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b, 'smi'));

        expect(emojiArray).toEqual([smileEmoji, dashEmoji, goatEmoji]);
    });

    test('should be able to sort on aliases', () => {
        const goatEmoji = {
            aliases: [':goat:'],
        };

        const dashEmoji = {
            aliases: [':dash:'],
        };

        const smileEmoji = {
            aliases: [':smile:'],
        };

        const emojiArray = [goatEmoji, dashEmoji, smileEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b));

        expect(emojiArray).toEqual([dashEmoji, goatEmoji, smileEmoji]);
    });

    test('special case for thumbsup emoji should sort it before thumbsdown by aliases', () => {
        const thumbsUpEmoji = {
            aliases: ['+1'],
        };

        const thumbsDownEmoji = {
            aliases: ['-1'],
        };

        const smileEmoji = {
            aliases: ['smile'],
        };

        const emojiArray = [thumbsDownEmoji, thumbsUpEmoji, smileEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b));

        expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, smileEmoji]);
    });

    test('special case for thumbsup emoji should sort it before thumbsdown by names', () => {
        const thumbsUpEmoji = {
            name: 'thumbsup',
        };

        const thumbsDownEmoji = {
            name: 'thumbsdown',
        };

        const smileEmoji = {
            name: 'smile',
        };

        const emojiArray = [thumbsDownEmoji, thumbsUpEmoji, smileEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b));

        expect(emojiArray).toEqual([smileEmoji, thumbsUpEmoji, thumbsDownEmoji]);
    });

    test('special case for thumbsup emoji should sort it when emoji is matched', () => {
        const thumbsUpEmoji = {
            name: 'thumbsup',
        };

        const thumbsDownEmoji = {
            name: 'thumbsdown',
        };

        const smileEmoji = {
            name: 'smile',
        };

        const emojiArray = [thumbsDownEmoji, thumbsUpEmoji, smileEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

        expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, smileEmoji]);
    });

    test('special case for thumbsup emoji should sort custom "thumb" emojis after system', () => {
        const thumbsUpEmoji = {
            aliases: ['+1', 'thumbsup'],
            category: 'default',
        };

        const thumbsDownEmoji = {
            name: 'thumbsdown',
            category: 'default',
        };

        const thumbsUpCustomEmoji = {
            name: 'thumbsup-custom',
            category: 'custom',
        };

        const emojiArray = [thumbsUpCustomEmoji, thumbsDownEmoji, thumbsUpEmoji];
        emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

        expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, thumbsUpCustomEmoji]);
    });
});

describe('wrapEmojis', () => {
    // Note that the keys used by some of these may appear to be incorrect because they're counting Unicode code points
    // instead of just characters. Also, if these tests return results that serialize to the same string, that means
    // that the key for a span is incorrect.

    test('should return the original string if it contains no emojis', () => {
        const input = 'this is a test 1234';

        expect(wrapEmojis(input)).toBe(input);
    });

    test('should wrap a single emoji in a span', () => {
        const input = '🌮';

        expect(wrapEmojis(input)).toEqual(
            <span
                key='0'
                className='emoji'
            >
                {'🌮'}
            </span>,
        );
    });

    test('should wrap a single emoji in a span with surrounding text', () => {
        const input = 'this is 🌮 a test 1234';

        expect(wrapEmojis(input)).toEqual([
            'this is ',
            <span
                key='8'
                className='emoji'
            >
                {'🌮'}
            </span>,
            ' a test 1234',
        ]);
    });

    test('should wrap multiple emojis in spans', () => {
        const input = 'this is 🌮 a taco 🎉 1234';

        expect(wrapEmojis(input)).toEqual([
            'this is ',
            <span
                key='8'
                className='emoji'
            >
                {'🌮'}
            </span>,
            ' a taco ',
            <span
                key='18'
                className='emoji'
            >
                {'🎉'}
            </span>,
            ' 1234',
        ]);
    });

    test('should properly handle adjacent emojis', () => {
        const input = '🌮🎉🇫🇮🍒';

        expect(wrapEmojis(input)).toEqual([
            <span
                key='0'
                className='emoji'
            >
                {'🌮'}
            </span>,
            <span
                key='2'
                className='emoji'
            >
                {'🎉'}
            </span>,
            <span
                key='4'
                className='emoji'
            >
                {'🇫🇮'}
            </span>,
            <span
                key='8'
                className='emoji'
            >
                {'🍒'}
            </span>,
        ]);
    });

    test('should properly handle unsupported emojis', () => {
        const input = 'this is 🤟 a test';

        expect(wrapEmojis(input)).toEqual([
            'this is ',
            <span
                key='8'
                className='emoji'
            >
                {'🤟'}
            </span>,
            ' a test',
        ]);
    });

    test('should properly handle emojis with variations', () => {
        const input = 'this is 👍🏿👍🏻 a test ✊🏻✊🏿';

        expect(wrapEmojis(input)).toEqual([
            'this is ',
            <span
                key='8'
                className='emoji'
            >
                {'👍🏿'}
            </span>,
            <span
                key='12'
                className='emoji'
            >
                {'👍🏻'}
            </span>,
            ' a test ',
            <span
                key='24'
                className='emoji'
            >
                {'✊🏻'}
            </span>,
            <span
                key='27'
                className='emoji'
            >
                {'✊🏿'}
            </span>,
        ]);
    });
});
