// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Quill from 'quill';

const Embed = Quill.import('blots/embed');

export default class EmojiBlot extends Embed {
    static create(value) {
        const node = super.create(value);
        const name = value.name;
        node.setAttribute('data-emoticon', name);

        const innerEmoji = document.createElement('span');
        innerEmoji.setAttribute('alt', `:${name}:`);
        innerEmoji.setAttribute('class', 'emoticon');
        innerEmoji.setAttribute('title', `:${name}:`);
        innerEmoji.setAttribute('style', `background-image: url('${value.imageUrl}');`);

        node.appendChild(innerEmoji);
        return node;
    }

    static value(node) {
        return {
            name: node.getAttribute('data-emoticon'),
        };
    }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'span';
