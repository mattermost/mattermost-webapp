// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Emoji} from 'mattermost-redux/types/emojis';

import {compareEmojis} from 'utils/emoji_utils';

describe('Emoji Utils', () => {
    describe('compareEmojis', () => {
        test('should sort an array of emojis alphabetically', () => {
            const goatEmoji: Emoji = {
                id: 'EMOJI_1',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'goat',
                category: 'custom',
            };

            const dashEmoji: Emoji = {
                id: 'EMOJI_2',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'dash',
                category: 'custom',
            };

            const smileEmoji: Emoji = {
                id: 'EMOJI_3',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'smile',
                category: 'custom',
            };

            const emojiArray = [goatEmoji, dashEmoji, smileEmoji];
            emojiArray.sort(compareEmojis);

            expect(emojiArray).toEqual([dashEmoji, goatEmoji, smileEmoji]);
        });

        test('should have partiall matched emoji first', () => {
            const goatEmoji: Emoji = {
                id: 'EMOJI_1',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'goat',
                category: 'custom',
            };

            const dashEmoji: Emoji = {
                id: 'EMOJI_2',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'dash',
                category: 'custom',
            };

            const smileEmoji: Emoji = {
                id: 'EMOJI_3',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'smile',
                category: 'custom',
            };

            const emojiArray = [goatEmoji, dashEmoji, smileEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'smi'));

            expect(emojiArray).toEqual([smileEmoji, dashEmoji, goatEmoji]);
        });

        test('should be able to sort on aliases', () => {
            const goatEmoji: Emoji = {
                aliases: [':goat:'],
                category: 'nature',
                filename: 'FILENAME',
                batch: 1,
            };

            const dashEmoji: Emoji = {
                aliases: [':dash:'],
                category: 'activity',
                filename: 'FILENAME',
                batch: 1,
            };

            const smileEmoji: Emoji = {
                aliases: [':smile:'],
                category: 'people',
                filename: 'FILENAME',
                batch: 1,
            };

            const emojiArray = [goatEmoji, dashEmoji, smileEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b));

            expect(emojiArray).toEqual([dashEmoji, goatEmoji, smileEmoji]);
        });

        test('special case for thumbsup emoji should sort it before thumbsdown by aliases', () => {
            const thumbsUpEmoji: Emoji = {
                aliases: ['+1'],
                category: 'people',
                filename: 'FILENAME',
                batch: 1,
            };

            const thumbsDownEmoji: Emoji = {
                aliases: ['-1'],
                category: 'people',
                filename: 'FILENAME',
                batch: 1,
            };

            const smileEmoji: Emoji = {
                aliases: ['smile'],
                category: 'symbols',
                filename: 'FILENAME',
                batch: 1,
            };

            const emojiArray = [thumbsDownEmoji, thumbsUpEmoji, smileEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b));

            expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, smileEmoji]);
        });

        test('special case for thumbsup emoji should sort it before thumbsdown by names', () => {
            const thumbsUpEmoji: Emoji = {
                id: 'EMOJI_1',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'thumbsup',
                category: 'custom',
            };

            const thumbsDownEmoji: Emoji = {
                id: 'EMOJI_2',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'thumbsdown',
                category: 'custom',
            };

            const smileEmoji: Emoji = {
                id: 'EMOJI_3',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'smile',
                category: 'custom',
            };

            const emojiArray = [thumbsDownEmoji, thumbsUpEmoji, smileEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b));

            expect(emojiArray).toEqual([smileEmoji, thumbsUpEmoji, thumbsDownEmoji]);
        });

        test('special case for thumbsup emoji should sort it when emoji is matched', () => {
            const thumbsUpEmoji: Emoji = {
                id: 'EMOJI_1',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'thumbsup',
                category: 'custom',
            };

            const thumbsDownEmoji: Emoji = {
                id: 'EMOJI_2',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'thumbsdown',
                category: 'custom',
            };

            const smileEmoji: Emoji = {
                id: 'EMOJI_3',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'smile',
                category: 'custom',
            };

            const emojiArray = [thumbsDownEmoji, thumbsUpEmoji, smileEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

            expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, smileEmoji]);
        });

        test('special case for thumbsup emoji should sort custom "thumb" emojis after system', () => {
            const thumbsUpEmoji: Emoji = {
                aliases: ['+1', 'thumbsup'],
                category: 'people',
                filename: 'FILENAME',
                batch: 1,
            };

            const thumbsDownEmoji: Emoji = {
                id: 'EMOJI_1',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'thumbsdown',
                category: 'custom'
            };

            const thumbsUpCustomEmoji: Emoji = {
                id: 'EMOJI_2',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                creator_id: 'USER_1',
                name: 'thumbsup-custom',
                category: 'custom'
            };

            const emojiArray = [thumbsUpCustomEmoji, thumbsDownEmoji, thumbsUpEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

            expect(emojiArray).toEqual([thumbsUpEmoji, thumbsDownEmoji, thumbsUpCustomEmoji]);
        });
    });
});
