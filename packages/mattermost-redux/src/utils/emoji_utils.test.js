// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as EmojiUtils from 'mattermost-redux/utils/emoji_utils';

describe('EmojiUtils', () => {
    describe('parseNeededCustomEmojisFromText', () => {
        it('no emojis', () => {
            const actual = EmojiUtils.parseNeededCustomEmojisFromText(
                'This has no emojis',
                new Map(),
                new Map(),
                new Map(),
            );
            const expected = new Set([]);

            assert.deepEqual(actual, expected);
        });

        it('some emojis', () => {
            const actual = EmojiUtils.parseNeededCustomEmojisFromText(
                ':this: :is_all: :emo-jis: :123:',
                new Map(),
                new Map(),
                new Map(),
            );
            const expected = new Set(['this', 'is_all', 'emo-jis', '123']);

            assert.deepEqual(actual, expected);
        });

        it('text surrounding emojis', () => {
            const actual = EmojiUtils.parseNeededCustomEmojisFromText(
                ':this:/:is_all: (:emo-jis:) surrounding:123:text:456:asdf',
                new Map(),
                new Map(),
                new Map(),
            );
            const expected = new Set(['this', 'is_all', 'emo-jis', '123', '456']);

            assert.deepEqual(actual, expected);
        });

        it('system emojis', () => {
            const actual = EmojiUtils.parseNeededCustomEmojisFromText(
                ':this: :is_all: :emo-jis: :123:',
                new Map([['this', {name: 'this'}], ['123', {name: '123'}]]),
                new Map(),
                new Map(),
            );
            const expected = new Set(['is_all', 'emo-jis']);

            assert.deepEqual(actual, expected);
        });

        it('custom emojis', () => {
            const actual = EmojiUtils.parseNeededCustomEmojisFromText(
                ':this: :is_all: :emo-jis: :123:',
                new Map(),
                new Map([['is_all', {name: 'is_all'}], ['emo-jis', {name: 'emo-jis'}]]),
                new Map(),
            );
            const expected = new Set(['this', '123']);

            assert.deepEqual(actual, expected);
        });

        it('emojis that we\'ve already tried to load', () => {
            const actual = EmojiUtils.parseNeededCustomEmojisFromText(
                ':this: :is_all: :emo-jis: :123:',
                new Map(),
                new Map(),
                new Map([['this', {name: 'this'}], ['emo-jis', {name: 'emo-jis'}]]),
            );
            const expected = new Set(['is_all', '123']);

            assert.deepEqual(actual, expected);
        });
    });

    describe('isSystemEmoji', () => {
        test('correctly identifies system emojis with category', () => {
            const sampleEmoji = {
                unified: 'z1z1z1',
                name: 'sampleEmoji',
                category: 'activities',
                short_names: ['sampleEmoji'],
                short_name: 'sampleEmoji',
                batch: 2,
                image: 'sampleEmoji.png',
            };
            expect(EmojiUtils.isSystemEmoji(sampleEmoji)).toBe(true);
        });

        test('correctly identifies system emojis without category', () => {
            const sampleEmoji = {
                unified: 'z1z1z1',
                name: 'sampleEmoji',
                short_names: ['sampleEmoji'],
                short_name: 'sampleEmoji',
                batch: 2,
                image: 'sampleEmoji.png',
            };
            expect(EmojiUtils.isSystemEmoji(sampleEmoji)).toBe(true);
        });

        test('correctly identifies custom emojis with category and without id', () => {
            const sampleEmoji = {
                category: 'custom',
            };
            expect(EmojiUtils.isSystemEmoji(sampleEmoji)).toBe(false);
        });

        test('correctly identifies custom emojis without category and with id', () => {
            const sampleEmoji = {
                id: 'sampleEmoji',
            };
            expect(EmojiUtils.isSystemEmoji(sampleEmoji)).toBe(false);
        });

        test('correctly identifies custom emojis with category and with id', () => {
            const sampleEmoji = {
                id: 'sampleEmoji',
                category: 'custom',
            };
            expect(EmojiUtils.isSystemEmoji(sampleEmoji)).toBe(false);
        });
    });

    describe('getEmojiImageUrl', () => {
        test('returns correct url for system emojis', () => {
            expect(EmojiUtils.getEmojiImageUrl({unified: 'system_emoji'})).toBe('/static/emoji/system_emoji.png');

            expect(EmojiUtils.getEmojiImageUrl({short_names: ['system_emoji_short_names']})).toBe('/static/emoji/system_emoji_short_names.png');
        });

        test('return correct url for mattermost emoji', () => {
            expect(EmojiUtils.getEmojiImageUrl({id: 'mattermost', category: 'custom'})).toBe('/static/emoji/mattermost.png');

            expect(EmojiUtils.getEmojiImageUrl({id: 'mattermost'})).toBe('/static/emoji/mattermost.png');
        });

        test('return correct url for custom emojis', () => {
            expect(EmojiUtils.getEmojiImageUrl({id: 'custom_emoji', category: 'custom'})).toBe('/api/v4/emoji/custom_emoji/image');

            expect(EmojiUtils.getEmojiImageUrl({id: 'custom_emoji'})).toBe('/api/v4/emoji/custom_emoji/image');
        });
    });
});
