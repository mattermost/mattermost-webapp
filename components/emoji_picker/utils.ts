// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    Emoji as _Emoji,
    SystemEmoji,
    CustomEmoji,
} from 'mattermost-redux/types/emojis';

export type EmojiCategory = (
    | 'people'
    | 'nature'
    | 'foods'
    | 'activity'
    | 'places'
    | 'objects'
    | 'symbols'
    | 'flags'
    | 'custom'
);

export type Emoji = _Emoji;

export function isSystemEmoji(emoji: Emoji): emoji is SystemEmoji {
    return 'batch' in emoji;
}

export function isCustomEmoji(emoji: Emoji): emoji is CustomEmoji {
    return 'name' in emoji;
}

export function getEmojiName(emoji: Emoji) {
    return isSystemEmoji(emoji) ? emoji.aliases[0] : emoji.name;
}
