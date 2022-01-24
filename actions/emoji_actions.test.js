// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'store';
import {getRecentEmojis, getEmojiMap} from 'selectors/emojis';
import * as EmojiActions from 'actions/emoji_actions';
import LocalStorageStore from 'stores/local_storage_store';

const currentUserId = 'current_user_id';
const initialState = {
    entities: {
        users: {
            currentUserId,
        },
    },
};

const setRecentEmojisSpy = jest.spyOn(LocalStorageStore, 'setRecentEmojis').mockImplementation(() => {
    return true;
});

jest.mock('selectors/emojis', () => ({
    getRecentEmojis: jest.fn(),
    getEmojiMap: jest.fn(),
}));

describe('Actions.Emojis', () => {
    let store;
    beforeEach(async () => {
        store = await configureStore(initialState);
    });

    test('Emoji alias is stored in recent emojis', async () => {
        getRecentEmojis.mockImplementation(() => {
            return [];
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['grinning', {short_name: 'grinning'}]]);
        });

        store.dispatch(EmojiActions.addRecentEmoji('grinning'));
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, [{name: 'grinning', usageCount: 1}]);
    });

    test('First alias is stored in recent emojis even if second alias used', async () => {
        getRecentEmojis.mockImplementation(() => {
            return [];
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['thumbsup', {short_name: '+1'}]]);
        });

        await store.dispatch(EmojiActions.addRecentEmoji('thumbsup'));
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, [{name: '+1', usageCount: 1}]);
    });

    test('Invalid emoji are not stored in recents', async () => {
        getRecentEmojis.mockImplementation(() => {
            return [];
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['smile', {short_name: 'smile'}]]);
        });

        store.dispatch(EmojiActions.addRecentEmoji('gamgamstyle'));
        expect(setRecentEmojisSpy).not.toHaveBeenCalled();
    });

    test('Emoji already present in recent should be bumped on the top', async () => {
        getRecentEmojis.mockImplementation(() => {
            return [
                {name: 'smile', usageCount: 1},
                {name: 'grinning', usageCount: 1},
                {name: 'shell', usageCount: 1},
                {name: 'ladder', usageCount: 1},
            ];
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['grinning', {short_name: 'grinning'}]]);
        });

        store.dispatch(EmojiActions.addRecentEmoji('grinning'));
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, [
            {name: 'smile', usageCount: 1},
            {name: 'grinning', usageCount: 2},
            {name: 'shell', usageCount: 1},
            {name: 'ladder', usageCount: 1},
        ]);
    });

    test('Recent list lenght should always be of size less than or equal to max_recent_size', async () => {
        const recentEmojisList = [
            {name: 'smile', usageCount: 1},
            {name: 'grinning', usageCount: 1},
            {name: 'shell', usageCount: 1},
            {name: 'ladder', usageCount: 1},
            {name: '1', usageCount: 1},
            {name: '2', usageCount: 1},
            {name: '3', usageCount: 1},
            {name: '4', usageCount: 1},
            {name: '5', usageCount: 1},
            {name: '6', usageCount: 1},
            {name: '7', usageCount: 1},
            {name: '8', usageCount: 1},
            {name: '9', usageCount: 1},
            {name: '10', usageCount: 1},
            {name: '11', usageCount: 1},
            {name: '12', usageCount: 1},
            {name: '13', usageCount: 1},
            {name: '14', usageCount: 1},
            {name: '15', usageCount: 1},
            {name: '16', usageCount: 1},
            {name: '17', usageCount: 1},
            {name: '18', usageCount: 1},
            {name: '19', usageCount: 1},
            {name: '20', usageCount: 1},
            {name: '21', usageCount: 1},
            {name: '22', usageCount: 1},
            {name: '23', usageCount: 1},
        ];
        getRecentEmojis.mockImplementation(() => {
            return recentEmojisList;
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['accept', {short_name: 'accept'}]]);
        });

        store.dispatch(EmojiActions.addRecentEmoji('accept'));

        const updatedRecentEmojis = [...recentEmojisList.slice(1, EmojiActions.MAX_RECENT_EMOJIS), {name: 'accept', usageCount: 1}];
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, updatedRecentEmojis);
    });
});
