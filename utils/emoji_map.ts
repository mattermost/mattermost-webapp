// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CustomEmoji} from '@mattermost/types/emojis';

import * as Emoji from 'utils/emoji';

// Wrap the contents of the store so that we don't need to construct an ES6 map where most of the content
// (the system emojis) will never change. It provides the get/has functions of a map and an iterator so
// that it can be used in for..of loops
export default class EmojiMap {
    public customEmojis: Map<string, CustomEmoji>; // This should probably be private
    private customEmojisArray: Array<[string, CustomEmoji]>;

    constructor(customEmojis: Map<string, CustomEmoji>) {
        this.customEmojis = customEmojis;

        // Store customEmojis to an array so we can iterate it more easily
        this.customEmojisArray = [...customEmojis];
    }

    has(name: string) {
        return Emoji.EmojiIndicesByAlias.has(name) || this.customEmojis.has(name);
    }

    hasSystemEmoji(name: string) {
        return Emoji.EmojiIndicesByAlias.has(name);
    }

    hasUnicode(codepoint: string) {
        return Emoji.EmojiIndicesByUnicode.has(codepoint);
    }

    get(name: string) {
        if (Emoji.EmojiIndicesByAlias.has(name)) {
            return Emoji.Emojis[Emoji.EmojiIndicesByAlias.get(name) as number];
        }

        return this.customEmojis.get(name);
    }

    getUnicode(codepoint: string) {
        return Emoji.Emojis[Emoji.EmojiIndicesByUnicode.get(codepoint) as number];
    }

    [Symbol.iterator]() {
        const customEmojisArray = this.customEmojisArray;

        return {
            systemIndex: 0,
            customIndex: 0,
            next() {
                if (this.systemIndex < Emoji.Emojis.length) {
                    const emoji = Emoji.Emojis[this.systemIndex];

                    this.systemIndex += 1;

                    return {value: [emoji.short_names[0], emoji]};
                }

                if (this.customIndex < customEmojisArray.length) {
                    const emoji = customEmojisArray[this.customIndex][1];

                    this.customIndex += 1;

                    return {value: [emoji.name, emoji]};
                }

                return {done: true};
            },
        };
    }
}
