// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Parser, ProcessNodeDefinitions} from 'html-to-react';

import AtMention from 'components/at_mention';
import LatexBlock from 'components/latex_block';
import LinkTooltip from 'components/link_tooltip/link_tooltip';
import MarkdownImage from 'components/markdown_image';
import PostEmoji from 'components/post_emoji';

/*
 * Converts HTML to React components using html-to-react.
 * The following options can be specified:
 * - mentions - If specified, mentions are replaced with the AtMention component. Defaults to true.
 * - emoji - If specified, emoji text is replaced with the PostEmoji component. Defaults to true.
 * - images - If specified, markdown images are replaced with the image component. Defaults to true.
 * - imageProps - If specified, any extra props that should be passed into the image component.
 * - latex - If specified, latex is replaced with the LatexBlock component. Defaults to true.
 * - imagesMetadata - the dimensions of the image as retrieved from post.metadata.images.
 * - hasPluginTooltips - If specified, the LinkTooltip component is placed inside links. Defaults to false.
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

    const processingInstructions = [

        // Workaround to fix MM-14931
        {
            replaceChildren: false,
            shouldProcessNode: (node) => node.type === 'tag' && node.name === 'input' && node.attribs.type === 'checkbox',
            processNode: (node) => {
                const attribs = node.attribs || {};
                node.attribs.checked = Boolean(attribs.checked);

                return React.createElement('input', {...node.attribs});
            },
        },
    ];

    if (options.hasPluginTooltips) {
        const hrefAttrib = 'href';
        processingInstructions.push({
            replaceChildren: true,
            shouldProcessNode: (node) => node.type === 'tag' && node.name === 'a' && node.attribs[hrefAttrib],
            processNode: (node, children) => {
                return (
                    <LinkTooltip
                        href={node.attribs[hrefAttrib]}
                        title={children[0]}
                    />
                );
            },
        });
    }
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

                return <PostEmoji name={emojiName}/>;
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

                return (
                    <MarkdownImage
                        className={className}
                        imageMetadata={options.imagesMetadata && options.imagesMetadata[attribs.src]}
                        {...attribs}
                        {...options.imageProps}
                    />
                );
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
