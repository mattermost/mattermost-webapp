// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';

import {EmojiMap} from 'stores/emoji_store.jsx';

export const getEmojiMap = createSelector(
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    }
);
