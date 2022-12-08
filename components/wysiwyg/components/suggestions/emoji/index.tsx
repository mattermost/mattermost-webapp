// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {NodeViewProps} from '@tiptap/core/src/types';
import {Mention} from '@tiptap/extension-mention';
import {NodeViewWrapper, ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';

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
            <RenderEmoji emojiName={label}/>
        </NodeViewWrapper>
    );
};

const EmojiSuggestion = Mention.extend({
    name: WysiwygPluginNames.EMOJI_SUGGESTION,

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

    /**
     * TODO@michel:
     * Currently broken. Does mess with the Prosemirror Range and breaks it when
     * adding in emojis at the start of the message
     */
    // addInputRules() {
    //     return [
    //         nodeInputRule({
    //             find: /((^:|\s:)(\w+):\s)/,
    //             type: this.type,
    //             getAttributes: (match) => {
    //                 console.log('##### match data', match.data);
    //                 console.log('##### match', match);
    //                 return {
    //                     id: match[3],
    //                     label: match[3],
    //                     type: 'emoji',
    //                 };
    //             },
    //         }),
    //     ];
    // },
}).configure({

    // we need this so that `editor.getHtml()` does get the correct value inside of the `span` tag
    renderLabel({options, node}) {
        return `${options.suggestion.char}${node.attrs.label}${options.suggestion.char}`;
    },
});

export * from './suggestion';

export default EmojiSuggestion;
