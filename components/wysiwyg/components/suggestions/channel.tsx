// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ReactRenderer} from '@tiptap/react';
import {Mention} from '@tiptap/extension-mention';
import {SuggestionOptions} from '@tiptap/suggestion';
import {PluginKey} from 'prosemirror-state';

const SuggestionPluginKey = new PluginKey('channel-suggestions');

import SuggestionList, {SuggestionListProps, SuggestionListRef, SuggestionItem} from '../suggestion-list';

const suggestion: Omit<SuggestionOptions<SuggestionItem>, 'editor'> = {
    char: '~',

    pluginKey: SuggestionPluginKey,

    items: ({query}) => {
        return [
            'Town Square',
            'Broadcast',
            'Off Topic',
            'Random Channel 1',
            'Random Channel 2',
            'Random Channel 3',
        ].
            filter((item) => item.toLowerCase().startsWith(query.toLowerCase())).
            map((name) => ({
                id: name.toLowerCase().replace(' ', '.'),
                label: name,
            })).
            slice(0, 10);
    },

    render: () => {
        let reactRenderer: ReactRenderer<SuggestionListRef>;
        let savedProps: SuggestionListProps;

        return {
            onStart: (props) => {
                savedProps = {
                    ...props,
                    visible: true,
                };
                reactRenderer = new ReactRenderer(SuggestionList, {
                    props: savedProps,
                    editor: props.editor,
                });
            },

            onUpdate(props) {
                savedProps = {...savedProps, ...props};
                reactRenderer.updateProps(savedProps);
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    savedProps = {...savedProps, visible: false};
                    reactRenderer.updateProps(savedProps);
                    return true;
                }
                return reactRenderer.ref?.onKeyDown(props) || false;
            },

            onExit() {
                reactRenderer.destroy();
            },
        };
    },
};

const ChannelSuggestions = Mention.extend({
    name: 'channel-suggestions',
}).configure({
    HTMLAttributes: {
        class: 'at-mention',
    },
    suggestion,
});

export default ChannelSuggestions;
