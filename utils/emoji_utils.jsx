// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const defaultRule = (aName, bName) => {
    return aName.localeCompare(bName);
};

const thumbsDownRule = (other) =>
    (other === 'thumbsup' || other === '+1' ? 1 : 0);
const thumbsUpRule = (other) => (other === 'thumbsdown' || other === '-1' ? -1 : 0);

const customRules = {
    thumbsdown: thumbsDownRule,
    '-1': thumbsDownRule,
    thumbsup: thumbsUpRule,
    '+1': thumbsUpRule
};

export function compareEmojis(emojiA, emojiB, searchedName) {
    const aName = emojiA.name || emojiA.aliases[0];
    const bName = emojiB.name || emojiB.aliases[0];

    // Have the emojis that contain the search appear first
    const aPrefix = aName.startsWith(searchedName);
    const bPrefix = bName.startsWith(searchedName);

    if (aPrefix === bPrefix) {
        if (customRules[aName]) {
            return customRules[aName](bName) || defaultRule(aName, bName);
        }

        return defaultRule(aName, bName, searchedName);
    } else if (aPrefix) {
        return -1;
    }

    return 1;
}