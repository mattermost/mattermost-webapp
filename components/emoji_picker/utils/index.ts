// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Emoji, EmojiCategory} from 'mattermost-redux/types/emojis';

import {compareEmojis} from 'utils/emoji_utils';

import {Categories} from '../types';

function sortEmojis(emojis: Emoji[], recentEmojiStrings: string[], filter: string) {
    const recentEmojis: Emoji[] = [];
    const emojisMinusRecent: Emoji[] = [];

    Object.values(emojis).forEach((emoji) => {
        let emojiArray = emojisMinusRecent;
        const alias = 'short_names' in emoji ? emoji.short_names : [emoji.name];
        for (let i = 0; i < alias.length; i++) {
            if (recentEmojiStrings.includes(alias[i].toLowerCase())) {
                emojiArray = recentEmojis;
            }
        }

        emojiArray.push(emoji);
    });

    return [
        ...recentEmojis.sort((firstEmoji, secondEmoji) => compareEmojis(firstEmoji, secondEmoji, filter)),
        ...emojisMinusRecent.sort((firstEmoji, secondEmoji) => compareEmojis(firstEmoji, secondEmoji, filter)),
    ];
}

function getFilteredEmojis(allEmojis: Record<string, Emoji>, filter: string, recentEmojisString: string[]): Emoji[] {
    const emojis = Object.values(allEmojis).filter((emoji) => {
        const alias = 'short_names' in emoji ? emoji.short_names : [emoji.name];
        for (let i = 0; i < alias.length; i++) {
            if (alias[i].toLowerCase().includes(filter)) {
                return true;
            }
        }

        return false;
    });

    return sortEmojis(emojis, recentEmojisString, filter);
}

export function getEmojisByCategory(allEmojis: Record<string, Emoji>, categories: Categories, categoryName: EmojiCategory, filter: string, recentEmojisString: string[]): Emoji[] {
    if (filter.length) {
        return getFilteredEmojis(allEmojis, filter, recentEmojisString);
    }

    // if (categoryName === 'recent') {
    //     const recentEmojiIds = this.state.categories?.recent?.emojiIds ?? [];
    //     if (recentEmojiIds.length === 0) {
    //         return [];
    //     }

    //     const recentEmojis = new Map();

    //     recentEmojiIds.forEach((emojiId) => {
    //         const emoji = this.state.allEmojis[emojiId];
    //         const emojiSkin = getSkin(emoji);

    //         if (emojiSkin) {
    //             const emojiWithUserSkin = this.convertEmojiToUserSkinTone(emoji, emojiSkin, this.props.userSkinTone);
    //             recentEmojis.set(emojiWithUserSkin.unified, emojiWithUserSkin);
    //         } else {
    //             recentEmojis.set(emojiId, emoji);
    //         }
    //     });

    //     return Array.from(recentEmojis.values());
    // }

    return categories[categoryName].emojiIds.map((emojiId) => allEmojis[emojiId]);
}
