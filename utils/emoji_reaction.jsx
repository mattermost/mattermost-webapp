// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function getEmojiReactionsMap(reactions) {
    const reactionsByName = new Map();
    const emojiNames = [];

    if (reactions) {
        for (const reaction of Object.values(reactions)) {
            const emojiName = reaction.emoji_name;

            if (reactionsByName.has(emojiName)) {
                reactionsByName.get(emojiName).push(reaction);
            } else {
                emojiNames.push(emojiName);
                reactionsByName.set(emojiName, [reaction]);
            }
        }
    }
    return {reactionsByName, emojiNames};
}

export function getEmojiReactionsCount(reactions) {
    const {emojiNames} = getEmojiReactionsMap(reactions);
    return emojiNames?.length;
}
