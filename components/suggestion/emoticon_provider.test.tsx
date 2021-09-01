// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EmojiMap from 'utils/emoji_map';

import EmoticonProvider, {
    MIN_EMOTICON_LENGTH,
    EMOJI_CATEGORY_SUGGESTION_BLOCKLIST,
} from 'components/suggestion/emoticon_provider';

jest.mock('selectors/emojis', () => ({
    getEmojiMap: jest.fn(),
    getRecentEmojis: jest.fn(),
}));

type TestEmoji = {name: string; category: string};

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
        const emojis = jest.requireMock('selectors/emojis');
        emojis.getEmojiMap.mockReturnValue(emojiMap);
        emojis.getRecentEmojis.mockReturnValue([]);

        for (const i of [MIN_EMOTICON_LENGTH, MIN_EMOTICON_LENGTH + 1]) {
            const pretext = `:${'s'.repeat(i)}`;

            emoticonProvider.handlePretextChanged(pretext, resultsCallback);
            expect(resultsCallback).toHaveBeenCalled();
        }
    });

    it('should order suggested emojis', () => {
        const pretext = ':thu';
        const recentEmojis = ['smile'];

        const emojis = jest.requireMock('selectors/emojis');
        emojis.getEmojiMap.mockReturnValue(emojiMap);
        emojis.getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        const results = args.items.filter((item: TestEmoji) => item.name.indexOf('skin') === -1);
        expect(results.map((item: TestEmoji) => item.name)).toEqual([
            'thumbsup', // thumbsup is a special case where it always appears before thumbsdown
            'thumbsdown',
            'thumbsdown-custom',
            'thumbsup-custom',
            'thunder_cloud_and_rain',
            'lithuania',
            'lithuania-custom',
        ]);
    });

    it('should not suggest emojis if no match', () => {
        const pretext = ':supercalifragilisticexpialidocious';
        const recentEmojis = ['smile'];

        const emojis = jest.requireMock('selectors/emojis');
        emojis.getEmojiMap.mockReturnValue(emojiMap);
        emojis.getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(0);
    });

    it('should exclude blocklisted emojis from suggested emojis', () => {
        const emojis = jest.requireMock('selectors/emojis');
        const pretext = ':blocklisted';
        const recentEmojis = ['blocklisted-1'];

        const blocklistedEmojis = EMOJI_CATEGORY_SUGGESTION_BLOCKLIST.reduce((map, category, index) => {
            const name = `blocklisted-${index}`;
            return map.set(name, {name, category});
        }, new Map());

        const customEmojisWithBlocklist: Map<string, {name: string; category: string}> = new Map([...blocklistedEmojis, ['not-blocklisted', {name: 'not-blocklisted', category: 'custom'}]]);
        const emojiMapWithBlocklist = new EmojiMap(customEmojisWithBlocklist);

        emojis.getEmojiMap.mockReturnValue(emojiMapWithBlocklist);
        emojis.getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(1);
        expect(args.items[0].name).toEqual('not-blocklisted');
    });

    it('should suggest emojis ordered by recently used first (system only)', () => {
        const pretext = ':thu';
        const emojis = ['thunder_cloud_and_rain', 'smile'];
        const emopjiModule = jest.requireMock('selectors/emojis');
        for (const thumbsup of ['+1', 'thumbsup']) {
            const recentEmojis = [...emojis, thumbsup];

            emopjiModule.getEmojiMap.mockReturnValue(emojiMap);
            emopjiModule.getRecentEmojis.mockReturnValue(recentEmojis);

            emoticonProvider.handlePretextChanged(pretext, resultsCallback);
            expect(resultsCallback).toHaveBeenCalled();
            const args = resultsCallback.mock.calls[0][0];
            const results = args.items.filter((item: TestEmoji) => item.name.indexOf('skin') === -1);
            expect(results.map((item: TestEmoji) => item.name)).toEqual([
                'thumbsup',
                'thunder_cloud_and_rain',
                'thumbsdown',
                'thumbsdown-custom',
                'thumbsup-custom',
                'lithuania',
                'lithuania-custom',
            ]);
        }
    });

    it('should suggest emojis ordered by recently used first (custom only)', () => {
        const pretext = ':thu';
        const recentEmojis = ['lithuania-custom', 'thumbsdown-custom', 'smile'];

        const emojis = jest.requireMock('selectors/emojis');
        emojis.getEmojiMap.mockReturnValue(emojiMap);
        emojis.getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        const results = args.items.filter((item: TestEmoji) => item.name.indexOf('skin') === -1);
        expect(results.map((item: TestEmoji) => item.name)).toEqual([
            'thumbsdown-custom',
            'lithuania-custom',
            'thumbsup',
            'thumbsdown',
            'thumbsup-custom',
            'thunder_cloud_and_rain',
            'lithuania',
        ]);
    });

    it('should suggest emojis ordered by recently used first (custom and system)', () => {
        const pretext = ':thu';
        const recentEmojis = ['thumbsdown-custom', 'lithuania-custom', 'thumbsup', '-1', 'smile'];

        const emojis = jest.requireMock('selectors/emojis');
        emojis.getEmojiMap.mockReturnValue(emojiMap);
        emojis.getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        const results = args.items.filter((item: TestEmoji) => item.name.indexOf('skin') === -1);
        expect(results.map((item: TestEmoji) => item.name)).toEqual([
            'thumbsup',
            'thumbsdown',
            'thumbsdown-custom',
            'lithuania-custom',
            'thumbsup-custom',
            'thunder_cloud_and_rain',
            'lithuania',
        ]);
    });

    it('should suggest emojis ordered by recently used first with partial name match', () => {
        const pretext = ':umbs';
        const recentEmojis = ['lithuania-custom', 'thumbsup-custom', '+1', 'smile'];
        const emojis = jest.requireMock('selectors/emojis');
        emojis.getEmojiMap.mockReturnValue(emojiMap);
        emojis.getRecentEmojis.mockReturnValue(recentEmojis);

        emoticonProvider.handlePretextChanged(pretext, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        const results = args.items.filter((item: TestEmoji) => item.name.indexOf('skin') === -1);
        expect(results.map((item: TestEmoji) => item.name)).toEqual([
            'thumbsup',
            'thumbsup-custom',
            'thumbsdown',
            'thumbsdown-custom',
        ]);
    });
});
