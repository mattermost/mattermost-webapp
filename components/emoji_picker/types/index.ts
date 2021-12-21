// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {EmojiCategory, Emoji} from 'mattermost-redux/types/emojis';

export type Category = {
    className: string;
    emojiIds?: string[];
    id: string;
    message: string;
    name: EmojiCategory;
    offset: number;
};

export type Categories = Record<EmojiCategory, Category>;

export type CategoryOrEmojiRow = {
    type: 'categoryHeaderRow' | 'emojisRow';
    row: EmojiCategory | Emoji[];
}
