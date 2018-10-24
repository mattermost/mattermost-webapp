// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import emojiReducer from 'reducers/views/emoji';
import {ActionTypes} from 'utils/constants';

describe('Reducers.Emoji', () => {
    const initialState = {
        emojiPickerCustomPage: 0,
        emojiPickerForLastMessage: false,
    };

    test('Initial state', () => {
        const nextState = emojiReducer(
            {},
            {}
        );
        expect(nextState).toEqual(initialState);
    });

    test('should change the \'emojiPickerForLastMessage\' to true after action', () => {
        const nextState = emojiReducer(
            {
                emojiPickerForLastMessage: false,
            },
            {
                type: ActionTypes.SHOW_LAST_MESSAGES_EMOJI_LIST,
            }
        );
        expect(nextState).toEqual({
            ...initialState,
            emojiPickerForLastMessage: true,
        });
    });

    test('should change the \'emojiPickerForLastMessage\' to false after action', () => {
        const nextState = emojiReducer(
            {
                emojiPickerForLastMessage: true,
            },
            {
                type: ActionTypes.HIDE_LAST_MESSAGES_EMOJI_LIST,
            }
        );
        expect(nextState).toEqual({
            ...initialState,
            emojiPickerForLastMessage: false,
        });
    });
});
