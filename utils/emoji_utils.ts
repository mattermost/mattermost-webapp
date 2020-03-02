
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Emoji} from 'mattermost-redux/types/emojis';
import {isCustomEmoji} from 'mattermost-redux/utils/emoji_utils';

const defaultRule = (aName: string, bName: string, emojiA: Emoji, emojiB: Emoji) => {
    if (emojiA && emojiB && emojiA.category === 'custom' && emojiB.category !== 'custom') {
        return 1;
    } else if (emojiB && emojiA && emojiB.category === 'custom' && emojiA.category !== 'custom') {
        return -1;
    }

    return aName.localeCompare(bName);
};

const thumbsDownRule = (otherName: string) => {
    if (otherName === 'thumbsup' || otherName === '+1') {
        return 1;
    }
    return 0;
};

const thumbsUpRule = (otherName: string) => {
    if (otherName === 'thumbsdown' || otherName === '-1') {
        return -1;
    }
    return 0;
};

const customRules = {
    thumbsdown: thumbsDownRule,
    '-1': thumbsDownRule,
    thumbsup: thumbsUpRule,
    '+1': thumbsUpRule,
} as { [key: string]: (name: string) => number };

export function getEmojiName(emoji: Emoji, searchedName?: string) {
    // There's an edge case for custom emojis that start with a thumb prefix.
    // It doesn't match the first alias for the relevant system emoji.
    // We don't have control over the names or aliases of custom emojis...
    // ... and how they compare to the relevant system ones.
    // So we need to search for a matching alias in the whole array.
    // E.g. thumbsup-custom vs [+1, thumbsup]

    if (isCustomEmoji(emoji)) {
        return emoji.name;
    }

    if (searchedName) {
        return emoji.aliases.find((alias) => alias.startsWith(searchedName)) || emoji.aliases[0];
    }

    return emoji.aliases[0];
}

export function compareEmojis(emojiA: Emoji, emojiB: Emoji, searchedName?: string) {
    const aName = getEmojiName(emojiA, searchedName);
    const bName = getEmojiName(emojiB, searchedName);

    // Have the emojis that contain the search appear first
    const aPrefix = aName.startsWith(searchedName || '');
    const bPrefix = bName.startsWith(searchedName || '');

    if (aPrefix === bPrefix) {
        if (customRules[aName]) {
            return customRules[aName](bName) || defaultRule(aName, bName, emojiA, emojiB);
        }

        return defaultRule(aName, bName, emojiA, emojiB);
    } else if (aPrefix) {
        return -1;
    }

    return 1;
}
