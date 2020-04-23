// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {compareEmojis} from 'utils/emoji_utils.jsx';

describe('Emoji', () => {
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
                category: 'default'
            };

            const thumbsDownEmoji = {
                name: 'thumbsdown',
                category: 'default'
            };

            const thumbsUpCustomEmoji = {
                name: 'thumbsup-custom',
                category: 'custom'
            };

            const emojiArray = [thumbsUpCustomEmoji, thumbsDownEmoji, thumbsUpEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

            expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, thumbsUpCustomEmoji]);
        });
    });
});
