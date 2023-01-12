// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {nodeInputRule, NodeViewProps} from '@tiptap/core';
import {nodePasteRule, NodeViewWrapper, ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';
import {Mention} from '@tiptap/extension-mention';

import {WysiwygPluginNames} from 'utils/constants';

import RenderEmoji from 'components/emoji/render_emoji';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        [WysiwygPluginNames.EMOJI_SUGGESTION]: {
            insertEmoji: (emoji: string) => ReturnType;
        };
    }
}

/**
 * Here it would be possibly to return different components based on the type.
 * This can be useful if we want to have the profile overlay being available for user mentions, or the amount of people
 * getting notified by special mentions, etc.
 */
export const RenderedEmoji = (props: NodeViewProps) => {
    const {id, type, label} = props.node.attrs;

    return (
        <NodeViewWrapper
            as={'span'}
            data-emoji-id={id}
            data-emoji-type={type}
            data-emoji-label={label}
        >
            <RenderEmoji
                emojiName={label}
                size={21}
            />
        </NodeViewWrapper>
    );
};

const EmojiSuggestion = Mention.extend({
    name: WysiwygPluginNames.EMOJI_SUGGESTION,

    renderText() {
        /**
         * this seems wrong, but the range caulculation is based on this method. It measures the length of the string
         * returned from this and adjusts the range. But since we use a react component to display the emoji this leads
         * to incorrect values and therefore breaks. Its a different story for components that render text inside.
         */
        return '';
    },

    addNodeView() {
        return renderReactNodeView(RenderedEmoji);
    },

    addCommands() {
        return {
            insertEmoji: (emoji) => ({tr, dispatch}) => {
                const node = this.type.create({type: 'emoji', label: emoji, id: emoji});

                if (dispatch) {
                    tr.replaceRangeWith(tr.selection.from, tr.selection.to, node);
                }

                return true;
            },
        };
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-emoji-id'),
                renderHTML: (attributes) => {
                    if (!attributes.id) {
                        return {};
                    }

                    return {
                        'data-emoji-id': attributes.id,
                    };
                },
            },
            type: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-emoji-type'),
                renderHTML: (attributes) => {
                    if (!attributes.type) {
                        return {};
                    }

                    return {
                        'data-emoji-type': attributes.type,
                    };
                },
            },
            label: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-emoji-label'),
                renderHTML: (attributes) => {
                    if (!attributes.label) {
                        return {};
                    }

                    return {
                        'data-emoji-label': attributes.label,
                    };
                },
            },
        };
    },
    addInputRules() {
        return [
            nodeInputRule({
                find: /((^:|\s:)(\w+):\s)/,
                type: this.type,
                getAttributes: (match) => {
                    return {
                        id: match[3],
                        label: match[3],
                        type: 'emoji',
                    };
                },
            }),
        ];
    },
    addPasteRules() {
        return [
            nodePasteRule({
                find: /((^:|\s:)(\w+):\s)/gm,
                type: this.type,
                getAttributes: (match) => {
                    return {
                        id: match[3],
                        label: match[3],
                        type: 'emoji',
                    };
                },
            }),
        ];
    },
}).configure({

    // we need this so that `editor.getHtml()` does get the correct value inside of the `span` tag
    renderLabel({options, node}) {
        return `${options.suggestion.char}${node.attrs.label}${options.suggestion.char}`;
    },
});

export * from './suggestion';

export default EmojiSuggestion;
