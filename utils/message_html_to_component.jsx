// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Parser, ProcessNodeDefinitions} from 'html-to-react';

import AtMention from 'components/at_mention';
import LatexBlock from 'components/latex_block';
import MarkdownImage from 'components/markdown_image';
import PostEmoji from 'components/post_emoji';

/*
 * Converts HTML to React components using html-to-react.
 * The following options can be specified:
 * - mentions - If specified, mentions are replaced with the AtMention component. Defaults to true.
 * - emoji - If specified, emoji text is replaced with the PostEmoji component. Defaults to true.
 * - images - If specified, markdown images are replaced with the MarkdownImage component. Defaults to true.
 * - imageProps - If specified, any extra props that should be passed into the MarkdownImage component.
 * - latex - If specified, latex is replaced with the LatexBlock component. Defaults to true.
 */
export function messageHtmlToComponent(html, isRHS, options = {}) {
    if (!html) {
        return null;
    }

    const parser = new Parser();
    const processNodeDefinitions = new ProcessNodeDefinitions(React);

    function isValidNode() {
        return true;
    }

    const processingInstructions = [];
    if (!('mentions' in options) || options.mentions) {
        const mentionAttrib = 'data-mention';
        processingInstructions.push({
            replaceChildren: true,
            shouldProcessNode: (node) => node.attribs && node.attribs[mentionAttrib],
            processNode: (node, children) => {
                const mentionName = node.attribs[mentionAttrib];
                const callAtMention = (
                    <AtMention
                        mentionName={mentionName}
                        isRHS={isRHS}
                        hasMention={true}
                    >
                        {children}
                    </AtMention>
                );
                return callAtMention;
            },
        });
    }

    if (!('emoji' in options) || options.emoji) {
        const emojiAttrib = 'data-emoticon';
        processingInstructions.push({
            replaceChildren: true,
            shouldProcessNode: (node) => node.attribs && node.attribs[emojiAttrib],
            processNode: (node) => {
                const emojiName = node.attribs[emojiAttrib];
                const callPostEmoji = (
                    <PostEmoji
                        name={emojiName}
                    />
                );
                return callPostEmoji;
            },
        });
    }

    if (!('images' in options) || options.images) {
        processingInstructions.push({
            shouldProcessNode: (node) => node.type === 'tag' && node.name === 'img',
            processNode: (node) => {
                const {
                    class: className,
                    ...attribs
                } = node.attribs;

                const callMarkdownImage = (
                    <MarkdownImage
                        className={className}
                        {...attribs}
                        {...options.imageProps}
                    />
                );
                return callMarkdownImage;
            },
        });
    }

    if (!('latex' in options) || options.latex) {
        processingInstructions.push({
            shouldProcessNode: (node) => node.attribs && node.attribs['data-latex'],
            processNode: (node) => {
                return (
                    <LatexBlock content={node.attribs['data-latex']}/>
                );
            },
        });
    }

    processingInstructions.push({
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode,
    });

    return parser.parseWithInstructions(html, isValidNode, processingInstructions);
}

export default messageHtmlToComponent;
