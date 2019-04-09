// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// find the emoji by name
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

const literalEmojiToName = new Map([[':)', 'slightly_smiling_face'], [':-)', 'slightly_smiling_face'], [';)', 'wink'], [';-)', 'wink'], [':o', 'open_mouth'], [':-o', 'scream'], [':]', 'smirk'], [':-]', 'smirk'], [':[', 'rage'], [':-[', 'rage'], [':D', 'smile'], [':-D', 'smile'], ['x-d', 'stuck_out_tongue_closed_eyes'], [':p', 'stuck_out_tongue'], [':-p', 'stuck_out_tongue'], [':(', 'slightly_frowning_face'], [':-(', 'slightly_frowning_face'], [':`(', 'cry'], [':`-(', 'cry'], [':/', 'confused'], [':-/', 'confused'], [':s', 'confounded'], [':-s', 'confounded'], [':|', 'neutral_face'], [':-|', 'neutral_face'], [':$', 'flushed'], [':-$', 'flushed'], [':x', 'mask'], [':-x', 'mask'], ['<3', 'heart'], ['</3', 'broken_heart'], [':+1', 'thumbsup'], [':-1', 'thumbsdown']]);

export const getEmojiUrl = (name, emojiMap) => {
    const emoji = emojiMap.get(name);
    let imageUrl = '';
    if (emoji) {
        imageUrl = getEmojiImageUrl(emoji);
    }

    return imageUrl;
};

const getPossibleText = (leafText, localCaret, numberOfChars) => {
    if (localCaret < numberOfChars) {
        return null;
    }

    // only bother trying to match the last word
    let startIdx = localCaret;
    while (startIdx > 0 && leafText.charAt(startIdx - 1) !== ' ') {
        startIdx--;
    }

    if (localCaret - startIdx < numberOfChars) {
        return null;
    }

    return leafText.slice(startIdx, localCaret);
};

export const detectEmojiOnColon = (leafText, localCaret, emojiMap) => {
    // TODO: handle config to disable this feature

    // emoji names must be at least 2 characters long, 4 including colons
    const text = getPossibleText(leafText, localCaret, 4);
    if (!text) {
        return null;
    }

    if (text.charAt(0) === ':' && text.charAt(text.length - 1) === ':') {
        const subText = text.slice(1, -1);
        if (emojiMap.has(subText)) {
            return {name: subText, text};
        }
    }

    return null;
};

export const detectLiteralEmojiOnSpace = (leafText, localCaret) => {
    // TODO: handle config to disable this feature

    const withoutSpace = leafText.slice(0, -1);

    // emoji's like :) must be at least 2 characters long
    const text = getPossibleText(withoutSpace, localCaret - 1, 2);
    if (!text) {
        return null;
    }

    const name = literalEmojiToName.get(text);
    if (name) {
        return {name, text: text + ' '};
    }
    return null;
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
