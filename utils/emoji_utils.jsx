// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const defaultRule = (aName, bName, emojiA, emojiB) => {
    if (emojiA.category === 'custom' && emojiB.category !== 'custom') {
        return 1;
    } else if (emojiB.category === 'custom' && emojiA.category !== 'custom') {
        return -1;
    }

    return aName.localeCompare(bName);
};

const thumbsDownRule = (other) =>
    (other === 'thumbsup' || other === '+1' ? 1 : 0);
const thumbsUpRule = (other) => (other === 'thumbsdown' || other === '-1' ? -1 : 0);

const customRules = {
    thumbsdown: thumbsDownRule,
    '-1': thumbsDownRule,
    thumbsup: thumbsUpRule,
    '+1': thumbsUpRule,
};

export function compareEmojis(emojiA, emojiB, searchedName) {
    // There's an edge case for custom emojis that start with a thumb prefix.
    // It doesn't match the first alias for the relevant system emoji.
    // We don't have control over the names or aliases of custom emojis...
    // ... and how they compare to the relevant system ones.
    // So we need to search for a matching alias in the whole array.
    // E.g. thumbsup-custom vs [+1, thumbsup]

    const getMatchingName = (emoji) =>
        emoji.name || emoji.aliases.find((alias) => alias.startsWith(searchedName)) || emoji.aliases[0];
    const aName = getMatchingName(emojiA);
    const bName = getMatchingName(emojiB);

    // Have the emojis that contain the search appear first
    const aPrefix = aName.startsWith(searchedName);
    const bPrefix = bName.startsWith(searchedName);

    if (aPrefix === bPrefix) {
        if (customRules[aName]) {
            return customRules[aName](bName, emojiB) || defaultRule(aName, bName, emojiA, emojiB);
        }

        return defaultRule(aName, bName, emojiA, emojiB);
    } else if (aPrefix) {
        return -1;
    }

    return 1;
}