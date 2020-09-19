// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import emojiRegex from 'emoji-regex';
import React from 'react';

import {Emoji} from 'mattermost-redux/types/emojis';

const defaultRule = (aName: string, bName: string, emojiA: Emoji, emojiB: Emoji) => {
    if (emojiA.category === 'custom' && emojiB.category !== 'custom') {
        return 1;
    } else if (emojiB.category === 'custom' && emojiA.category !== 'custom') {
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

const customRules: Record<string, (emojiName: string) => number> = {
    thumbsdown: thumbsDownRule,
    '-1': thumbsDownRule,
    thumbsup: thumbsUpRule,
    '+1': thumbsUpRule,
};

const getEmojiName = (emoji: Emoji, searchedName: string) => {
    // There's an edge case for custom emojis that start with a thumb prefix.
    // It doesn't match the first alias for the relevant system emoji.
    // We don't have control over the names or aliases of custom emojis...
    // ... and how they compare to the relevant system ones.
    // So we need to search for a matching alias in the whole array.
    // E.g. thumbsup-custom vs [+1, thumbsup]
    if (!emoji) {
        return '';
    }

    if ('name' in emoji) {
        return emoji.name;
    }

    if (searchedName) {
        return emoji.aliases.find((alias) => alias.startsWith(searchedName)) || emoji.aliases[0];
    }

    return emoji.aliases[0];
};

export function compareEmojis(emojiA: Emoji, emojiB: Emoji, searchedName: string) {
    const aName = getEmojiName(emojiA, searchedName);
    const bName = getEmojiName(emojiB, searchedName);

    // Have the emojis that starts with the search appear first
    const aPrefix = aName.startsWith(searchedName);
    const bPrefix = bName.startsWith(searchedName);

    if (aPrefix === bPrefix) {
        if (aName in customRules) {
            return customRules[aName](bName) || defaultRule(aName, bName, emojiA, emojiB);
        }

        return defaultRule(aName, bName, emojiA, emojiB);
    } else if (aPrefix) {
        return -1;
    }

    return 1;
}

// wrapEmojis takes a text string and returns it with any Unicode emojis wrapped by a span with the emoji class.
export function wrapEmojis(text: string): React.ReactNode {
    const nodes = [];

    let lastIndex = 0;

    // Manually split the string into an array of strings and spans wrapping individual emojis
    for (const match of text.matchAll(emojiRegex())) {
        const emoji = match[0];
        const index = match.index!;

        if (match.index !== lastIndex) {
            nodes.push(text.substring(lastIndex, index));
        }

        nodes.push(
            <span
                key={index}
                className='emoji'
            >
                {emoji}
            </span>,
        );

        // Remember that emojis can be multiple code points long when incrementing the index
        lastIndex = index + emoji.length;
    }

    if (lastIndex < text.length - 1) {
        nodes.push(text.substring(lastIndex));
    }

    // Only return an array if we're returning multiple nodes
    return nodes.length === 1 ? nodes[0] : nodes;
}
