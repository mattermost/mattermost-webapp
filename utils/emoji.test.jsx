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
    });
});
