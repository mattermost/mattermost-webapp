// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Quill from 'quill';

import {stripStylesKeepBackgroundImg} from './utils';

const Embed = Quill.import('blots/embed');

export default class EmojiBlot extends Embed {
    static blotName = 'emoji';
    static tagName = 'span';
    static className = 'emoticon';

    static create(value) {
        /**
         * The parent create function will give us a DOM Node
         * The DOM Node will be based on the provided tagName and className (which we'll have to remove).
         * eg, the Node will be <span class='emoticon'></span>
         */
        const node = super.create();
        const name = value.name || value.title.slice(1, -1);
        node.setAttribute('data-emoticon', name);
        node.removeAttribute('class');

        const innerEmoji = document.createElement('span');
        innerEmoji.setAttribute('alt', `:${name}:`);
        innerEmoji.setAttribute('class', 'emoticon');
        innerEmoji.setAttribute('title', `:${name}:`);
        innerEmoji.setAttribute('style', value.style);

        node.appendChild(innerEmoji);
        return node;
    }

    /**
     * The quill docs don't explain this well: value is called when the paste handler is trying to parse
     * the html contents of the ql-clipboard. If it picks up a span with class='emoticon' it will call
     * value(node) to extract the values from that node. The node that it matches will be the nested emoticon node
     * (not the wrapping data-emoticon node) -- but that's fine; the emoticon node is the one with all the info
     * we need, such as the style attribute.
     *
     * We are ORing because this is ALSO called when undo/redo is called, and it needs to rebuild a blot from the
     * the internal HTML representation. When it does that, it is trying to get the values from an emoji that has
     * three spans, eg:
     * <span data-emoticon="smile"><span contentEditable="false"><span alt=":smile:" className="emoticon" title=":smile:" style="background-image: url("http://localhost:8065/static/emoji/1f604.png");"> </span> </span></span>
     *
     * Then it will feed that object into the create function above to create a new emoji blot.
     *
     * We are also extracting a name value from the blot for when we convert the emoji blot into markdown
     * (when persisting). That will be called on blot's outer node, which has the data-emoticon attribute (the name).
     */
    static value(node) {
        const style = stripStylesKeepBackgroundImg(node.getAttribute('style') || node.firstElementChild.getAttribute('style') || node.firstElementChild.firstElementChild.getAttribute('style'));
        return {
            title: node.getAttribute('title') || node.firstElementChild.getAttribute('title') || node.firstElementChild.firstElementChild.getAttribute('title'),
            style,
            name: node.getAttribute('data-emoticon'),
        };
    }
}
