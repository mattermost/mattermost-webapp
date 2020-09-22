// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EmojiMap from 'utils/emoji_map';
import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import EmoticonProvider, {
    MIN_EMOTICON_LENGTH,
    EMOJI_CATEGORY_SUGGESTION_BLOCKLIST,
} from 'components/suggestion/emoticon_provider.jsx';

jest.mock('selectors/emojis', () => ({
    getEmojiMap: jest.fn(),
    getRecentEmojis: jest.fn(),
}));

describe('components/EmoticonProvider', () => {
    const resultsCallback = jest.fn();
    const emoticonProvider = new EmoticonProvider();
    const customEmojis = new Map([
        ['thumbsdown-custom', {name: 'thumbsdown-custom', category: 'custom'}],
        ['thumbsup-custom', {name: 'thumbsup-custom', category: 'custom'}],
        ['lithuania-custom', {name: 'lithuania-custom', category: 'custom'}],
    ]);
    const emojiMap = new EmojiMap(customEmojis);

    it('should not suggest emojis when partial name < MIN_EMOTICON_LENGTH', () => {
        for (let i = 0; i < MIN_EMOTICON_LENGTH; i++) {
            const pretext = `:${'s'.repeat(i)}`;
            emoticonProvider.handlePretextChanged(pretext, resultsCallback);
            expect(resultsCallback).not.toHaveBeenCalled();
        }
    });

    it('should suggest emojis when partial name >= MIN_EMOTICON_LENGTH', () => {
        getEmojiMap.mockReturnValue(emojiMap);
        getRecentEmojis.mockReturnValue([]);

        for (const i of [MIN_EMOTICON_LENGTH, MIN_EMOTICON_LENGTH + 1]) {
            const pretext = `:${'s'.repeat(i)}`;

            emoticonProvider.handlePretextChanged(pretext, resultsCallback);
            expect(resultsCallback).toHaveBeenCalled();
        }
    });

    it('should order suggested emojis', () => {
        const pretext = ':thu';
        const recentEmojis = ['smile'];
        getEmojiMap.mockReturnValue(emojiMap);
        getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(6);
        expect(args.items[0].name).toEqual('thumbsup');
        expect(args.items[1].name).toEqual('thumbsdown');
        expect(args.items[2].name).toEqual('thumbsdown-custom');
        expect(args.items[3].name).toEqual('thumbsup-custom');
        expect(args.items[4].name).toEqual('lithuania');
        expect(args.items[5].name).toEqual('lithuania-custom');
    });

    it('should not suggest emojis if no match', () => {
        const pretext = ':supercalifragilisticexpialidocious';
        const recentEmojis = ['smile'];

        getEmojiMap.mockReturnValue(emojiMap);
        getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(0);
    });

    it('should exclude blocklisted emojis from suggested emojis', () => {
        const pretext = ':blocklisted';
        const recentEmojis = ['blocklisted-1'];

        const blocklistedEmojis = EMOJI_CATEGORY_SUGGESTION_BLOCKLIST.map((category, index) => {
            const name = `blocklisted-${index}`;
            return [name, {name, category}];
        });
        const customEmojisWithBlocklist = new Map([
            ...blocklistedEmojis,
            ['not-blocklisted', {name: 'not-blocklisted', category: 'custom'}],
        ]);
        const emojiMapWithBlocklist = new EmojiMap(customEmojisWithBlocklist);

        getEmojiMap.mockReturnValue(emojiMapWithBlocklist);
        getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(1);
        expect(args.items[0].name).toEqual('not-blocklisted');
    });

    it('should suggest emojis ordered by recently used first (system only)', () => {
        const pretext = ':thu';
        const emojis = ['lithuania', 'smile'];
        for (const thumbsup of ['+1', 'thumbsup']) {
            const recentEmojis = [...emojis, thumbsup];
            getEmojiMap.mockReturnValue(emojiMap);
            getRecentEmojis.mockReturnValue(recentEmojis);

            emoticonProvider.handlePretextChanged(pretext, resultsCallback);
            expect(resultsCallback).toHaveBeenCalled();
            const args = resultsCallback.mock.calls[0][0];
            expect(args.items.length).toEqual(6);
            expect(args.items[0].name).toEqual('thumbsup');
            expect(args.items[1].name).toEqual('lithuania');
            expect(args.items[2].name).toEqual('thumbsdown');
            expect(args.items[3].name).toEqual('thumbsdown-custom');
            expect(args.items[4].name).toEqual('thumbsup-custom');
            expect(args.items[5].name).toEqual('lithuania-custom');
        }
    });

    it('should suggest emojis ordered by recently used first (custom only)', () => {
        const pretext = ':thu';
        const recentEmojis = ['lithuania-custom', 'thumbsdown-custom', 'smile'];
        getEmojiMap.mockReturnValue(emojiMap);
        getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(6);
        expect(args.items[0].name).toEqual('thumbsdown-custom');
        expect(args.items[1].name).toEqual('lithuania-custom');
        expect(args.items[2].name).toEqual('thumbsup');
        expect(args.items[3].name).toEqual('thumbsdown');
        expect(args.items[4].name).toEqual('thumbsup-custom');
        expect(args.items[5].name).toEqual('lithuania');
    });

    it('should suggest emojis ordered by recently used first (custom and system)', () => {
        const pretext = ':thu';
        const recentEmojis = ['thumbsdown-custom', 'lithuania-custom', 'thumbsup', '-1', 'smile'];
        getEmojiMap.mockReturnValue(emojiMap);
        getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(6);
        expect(args.items[0].name).toEqual('thumbsup');
        expect(args.items[1].name).toEqual('thumbsdown');
        expect(args.items[2].name).toEqual('thumbsdown-custom');
        expect(args.items[3].name).toEqual('lithuania-custom');
        expect(args.items[4].name).toEqual('thumbsup-custom');
        expect(args.items[5].name).toEqual('lithuania');
    });

    it('should suggest emojis ordered by recently used first with partial name match', () => {
        const pretext = ':umbs';
        const recentEmojis = ['lithuania-custom', 'thumbsup-custom', '+1', 'smile'];
        getEmojiMap.mockReturnValue(emojiMap);
        getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(4);
        expect(args.items[0].name).toEqual('thumbsup');
        expect(args.items[1].name).toEqual('thumbsup-custom');
        expect(args.items[2].name).toEqual('thumbsdown');
        expect(args.items[3].name).toEqual('thumbsdown-custom');
    });
});
