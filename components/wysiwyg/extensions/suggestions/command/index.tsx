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
const RenderedMention = (props: NodeViewProps) => {
    const {id, type, label} = props.node.attrs;

    return (
        <NodeViewWrapper
            as={'span'}
            data-command-id={id}
            data-command-type={type}
            data-command-label={label}
        >
            {'/'}{label}
        </NodeViewWrapper>
    );
};

const CommandSuggestions = Mention.extend({
    name: WysiwygPluginNames.SLASH_COMMAND,

    addNodeView() {
        return renderReactNodeView(RenderedMention);
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-command-id'),
            },
            type: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-command-type'),
            },
            label: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-command-label'),
            },
        };
    },
});

export * from './suggestion';

export default CommandSuggestions;
