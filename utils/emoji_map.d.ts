// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Emoji} from 'mattermost-redux/types/emojis';

export default class EmojiMap {
    constructor(customEmojis: any);
    customEmojis: any;
    customEmojisArray: any[];
    has(name: string): boolean;
    hasSystemEmoji(name: string): boolean;
    hasUnicode(codepoint: string): boolean;
    get(name: string): Emoji;
    getUnicode(codepoint: string): Emoji;
    [Symbol.iterator](): {
        systemIndex: number;
        customIndex: number;
        next(): {
            value: [string, Emoji];
            done: boolean;
        };
    };
}
