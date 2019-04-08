// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// find the emoji by name
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

export const getEmojiUrl = (name, emojiMap) => {
    const emoji = emojiMap.get(name);
    let imageUrl = '';
    if (emoji) {
        imageUrl = getEmojiImageUrl(emoji);
    }

    return imageUrl;
};

// Finds the longest substring that's at both the end of b and the start of a. For example,
// if a = "firepit" and b = "pitbull", findOverlap would return "pit".
export const findOverlap = (a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    for (let i = bLower.length; i > 0; i--) {
        const substring = bLower.substring(0, i);

        if (aLower.endsWith(substring)) {
            return substring;
        }
    }

    return '';
};

export const prepareMarkdown = (contents) => {
    // if the next element is an emoji, or is text without a leading space,
    // we need to insert a space or else the emoji won't render in markdown
    const nextElementRequiresSpace = (idx, elements) => {
        if (idx >= elements.length - 1 || !elements[idx + 1].hasOwnProperty('insert')) {
            return false;
        }

        const curElem = elements[idx];
        if (typeof curElem.insert == 'string' && curElem.insert.endsWith(' ')) {
            return false;
        }

        const nextElem = elements[idx + 1];

        switch (typeof nextElem.insert) {
        case 'string':
            if (nextElem.insert.startsWith('\n')) {
                return false;
            }
            return !nextElem.insert.startsWith(' ');
        case 'object':
            return nextElem.insert.hasOwnProperty('emoji');
        default:
            return false;
        }
    };

    // only have to handle insert and emoji for now.
    const newValue = contents.map((op, idx) => {
        if (!op.hasOwnProperty('insert')) {
            return '';
        }

        const needsSpace = nextElementRequiresSpace(idx, contents);

        switch (typeof op.insert) {
        case 'string':
            return op.insert + (needsSpace ? ' ' : '');
        case 'object':
            if (op.insert.hasOwnProperty('emoji')) {
                return ':' + op.insert.emoji.name + ':' + (needsSpace ? ' ' : '');
            }
            return '';
        default:
            return '';
        }
    }).join('').slice(0, -1); // slice to remove Quill's trailing newline

    return newValue;
};
