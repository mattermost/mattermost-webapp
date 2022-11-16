// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Client4} from 'mattermost-redux/client';

import {ReactRenderer} from '@tiptap/react';
import {SuggestionOptions} from '@tiptap/suggestion';
import {PluginKey} from 'prosemirror-state';

import {Constants, WysiwygPluginNames} from 'utils/constants';

import SuggestionList, {SuggestionItem, SuggestionListProps, SuggestionListRef} from '../suggestion-list';

import {GroupMentionItem, SpecialMentionItem, UserMentionItem} from './components';

const SuggestionPluginKey = new PluginKey(WysiwygPluginNames.AT_MENTION_SUGGESTION);

type AtMentionSuggestionOptions = {
    teamId: string;
    channelId: string;
    useSpecialMentions?: boolean;
}

export const makeAtMentionSuggestion: (options: AtMentionSuggestionOptions) => Omit<SuggestionOptions<SuggestionItem>, 'editor'> = ({teamId, channelId, useSpecialMentions = true}) => ({
    char: '@',

    pluginKey: SuggestionPluginKey,

    items: async ({query}: {query: string}) => {
        const {users: userInChannel, out_of_channel: userNotInChannel} = await Client4.autocompleteUsers(query, teamId, channelId, {limit: 30});
        const groups = await Client4.getGroups();
        const results: SuggestionItem[] = [];

        // add all users that are members of the channel to the results
        if (Array.isArray(userInChannel) && userInChannel.length > 0) {
            results.push(...userInChannel.map((user) => ({
                id: user.id,
                type: 'members',
                content: <UserMentionItem {...user}/>,
            })));
        }

        // add all found (and accessible) groups to the results
        if (Array.isArray(groups) && groups.length > 0) {
            results.push(...groups.map((group) => ({
                id: group.id,
                type: 'groups',
                content: <GroupMentionItem {...group}/>,
            })));
        }

        if (useSpecialMentions) {
            results.push(...Constants.SPECIAL_MENTIONS.map((special) => ({
                id: `${special}_mention`,
                type: 'special',
                content: <SpecialMentionItem name={special}/>,
            })));
        }

        // add all users to the result that are not a member of this channel
        if (Array.isArray(userNotInChannel) && userNotInChannel.length > 0) {
            results.push(...userNotInChannel.map((user) => ({
                id: user.id,
                type: 'nonmembers',
                content: <UserMentionItem {...user}/>,
            })));
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
