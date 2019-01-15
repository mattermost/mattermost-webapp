// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function compareEmojis(emojiA, emojiB, searchedName) {
    const aName = emojiA.name || emojiA.aliases[0];
    const bName = emojiB.name || emojiB.aliases[0];

    // Have the emojis that contain the search appear first
    const aPrefix = aName.startsWith(searchedName);
    const bPrefix = bName.startsWith(searchedName);

    if (aPrefix === bPrefix) {
        return aName.localeCompare(bName);
    } else if (aPrefix) {
        return -1;
    }

    return 1;
}