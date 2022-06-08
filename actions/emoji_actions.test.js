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
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, ['grinning']);
    });

    test('First alias is stored in recent emojis even if second alias used', async () => {
        getRecentEmojis.mockImplementation(() => {
            return [];
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['thumbsup', {short_name: '+1'}]]);
        });

        await store.dispatch(EmojiActions.addRecentEmoji('thumbsup'));
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, ['+1']);
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
            return ['smile', 'grinning', 'shell', 'ladder'];
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['grinning', {short_name: 'grinning'}]]);
        });

        store.dispatch(EmojiActions.addRecentEmoji('grinning'));
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, ['smile', 'shell', 'ladder', 'grinning']);
    });

    test('Recent list lenght should always be of size less than or equal to max_recent_size', async () => {
        const recentEmojisList = ['smile', 'grinning', 'shell', 'ladder', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
        getRecentEmojis.mockImplementation(() => {
            return recentEmojisList;
        });

        getEmojiMap.mockImplementation(() => {
            return new Map([['accept', {short_name: 'accept'}]]);
        });

        store.dispatch(EmojiActions.addRecentEmoji('accept'));

        const updatedRecentEmojis = [...recentEmojisList.slice(1, EmojiActions.MAX_RECENT_EMOJIS), 'accept'];
        expect(setRecentEmojisSpy).toHaveBeenCalledWith(currentUserId, updatedRecentEmojis);
    });
});
