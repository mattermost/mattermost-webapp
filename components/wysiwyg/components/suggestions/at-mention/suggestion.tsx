// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Client4} from 'mattermost-redux/client';

import {ReactRenderer} from '@tiptap/react';
import {SuggestionOptions} from '@tiptap/suggestion';
import {PluginKey} from 'prosemirror-state';

import {WysiwygPluginNames} from 'utils/constants';

import SuggestionList, {SuggestionItem, SuggestionListProps, SuggestionListRef} from '../suggestion-list';

import {UserMentionItem} from './components';

const SuggestionPluginKey = new PluginKey(WysiwygPluginNames.AT_MENTION_SUGGESTION);

export const makeAtMentionSuggestion: (teamId: string, channelId: string) => Omit<SuggestionOptions<SuggestionItem>, 'editor'> = (teamId: string, channelId: string) => ({
    char: '@',

    pluginKey: SuggestionPluginKey,

    items: async ({query}: {query: string}) => {
        const {users, out_of_channel: nonMembers} = await Client4.autocompleteUsers(query, teamId, channelId, {limit: 30});
        const groups = await Client4.getGroups();
        const results: SuggestionItem[] = [];
        if (Array.isArray(users) && users.length > 0) {
            results.push(
                ...users.map((user) => ({
                    id: user.id,
                    type: 'members',
                    content: <UserMentionItem {...user}/>,
                })),
            );
        }
        if (Array.isArray(groups) && groups.length > 0) {
            // results.push({labelDescriptor: {id: 'suggestion.mention.groups', defaultMessage: 'Group Mentions'}}, ...groups);
        }
        if (Array.isArray(nonMembers) && nonMembers.length > 0) {
            // results.push({labelDescriptor: {id: 'suggestion.mention.nonmembers', defaultMessage: 'Not in Channel'}}, ...nonMembers);
        }
        return results;
    },

    render: () => {
        let reactRenderer: ReactRenderer<SuggestionListRef>;
        let savedProps: SuggestionListProps;

        return {
            onStart: (props) => {
                savedProps = {
                    ...props,
                    visible: true,
                    renderSeparators: true,
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
});
