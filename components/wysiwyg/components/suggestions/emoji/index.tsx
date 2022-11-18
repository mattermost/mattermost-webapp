// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// See LICENSE.txt for license information.
import React from 'react';

import {NodeViewProps} from '@tiptap/core/src/types';
import {Mention} from '@tiptap/extension-mention';
import {NodeViewWrapper, ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';

import {WysiwygPluginNames} from 'utils/constants';

/**
 * Here it would be possibly to return different components based on the type.
 * This can be useful if we want to have the profile overlay being available for user mentions, or the amount of people
 * getting notified by special mentions, etc.
 */
const RenderedChannel = (props: NodeViewProps) => {
    const {id, type, label} = props.node.attrs;

    return (
        <NodeViewWrapper
            as={'span'}
            data-mention-id={id}
            data-mention-type={type}
        >
            {':'}{label}{':'}
        </NodeViewWrapper>
    );
};

const EmojiSuggestion = Mention.extend({
    name: WysiwygPluginNames.EMOJI_SUGGESTION,

    addNodeView() {
        return renderReactNodeView(RenderedChannel);
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-mention-id'),
                renderHTML: (attributes) => {
                    if (!attributes.id) {
                        return {};
                    }

                    return {
                        'data-mention-id': attributes.id,
                    };
                },
            },
            type: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-mention-type'),
                renderHTML: (attributes) => {
                    if (!attributes.type) {
                        return {};
                    }

                    return {
                        'data-mention-type': attributes.type,
                    };
                },
            },
            label: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-mention-label'),
                renderHTML: (attributes) => {
                    if (!attributes.label) {
                        return {};
                    }

                    return {
                        'data-mention-label': attributes.label,
                    };
                },
            },
        };
    },
}).configure({

    // we need this so that `editor.getHtml()` does get the correct value inside of the `span` tag
    renderLabel({options, node}) {
        return `${options.suggestion.char}${node.attrs.label}${options.suggestion.char}`;
    },
});

export * from './suggestion';

export default EmojiSuggestion;
