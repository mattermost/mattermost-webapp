// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// See LICENSE.txt for license information.
import React from 'react';
import {Client4} from 'mattermost-redux/client';
import {getSuggestionsSplitBy, getSuggestionsSplitByMultiple} from 'mattermost-redux/utils/user_utils';

import {SuggestionOptions} from '@tiptap/suggestion';
import {PluginKey} from 'prosemirror-state';

import {Constants, WysiwygPluginNames} from 'utils/constants';

import {Group} from '@mattermost/types/groups';

import {SuggestionItem} from '../suggestion-list';
import {render} from '../suggestion-base';

import {GroupMentionItem, SpecialMentionItem, UserMentionItem} from './components';

const SuggestionPluginKey = new PluginKey(WysiwygPluginNames.AT_MENTION_SUGGESTION);

type AtMentionSuggestionOptions = {
    teamId: string;
    channelId: string;
    useSpecialMentions?: boolean;
}

function getGroupSuggestions(group: Group): string[] {
    const groupSuggestions: string[] = [];
    if (!group) {
        return groupSuggestions;
    }

    if (group.name) {
        const groupnameSuggestions = getSuggestionsSplitByMultiple(group.name.toLowerCase(), Constants.AUTOCOMPLETE_SPLIT_CHARACTERS);
        groupSuggestions.push(...groupnameSuggestions);
    }

    const suggestions = getSuggestionsSplitBy(group.display_name.toLowerCase(), ' ');
    groupSuggestions.push(...suggestions);

    groupSuggestions.push(group.display_name.toLowerCase());
    return groupSuggestions;
}

function filterGroup(prefix: string, group: Group): boolean {
    if (!group) {
        return false;
    }

    const prefixLower = prefix.toLowerCase();
    const groupSuggestions = getGroupSuggestions(group);
    return groupSuggestions.some((suggestion) => suggestion.startsWith(prefixLower));
}

export const makeAtMentionSuggestion: (options: AtMentionSuggestionOptions) => Omit<SuggestionOptions<SuggestionItem>, 'editor'> = ({teamId, channelId, useSpecialMentions = true}) => ({
    char: '@',

    pluginKey: SuggestionPluginKey,

    items: async ({query}: {query: string}) => {
        const {users: userInChannel, out_of_channel: userNotInChannel} = await Client4.autocompleteUsers(query, teamId, channelId, {limit: 30});
        const groups = await Client4.getGroups();
        const filteredGroups = groups.filter((group) => filterGroup(query, group));
        const results: SuggestionItem[] = [];

        // add all users that are members of the channel to the results
        if (Array.isArray(userInChannel) && userInChannel.length > 0) {
            results.push(...userInChannel.map((user) => ({
                id: user.id,
                type: 'members',
                label: user.username,
                content: <UserMentionItem {...user}/>,
            })));
        }

        // add all found (and accessible) groups to the results
        if (Array.isArray(filteredGroups) && filteredGroups.length > 0) {
            results.push(...filteredGroups.map((group) => ({
                id: group.id,
                type: 'groups',
                label: group.display_name,
                content: <GroupMentionItem {...group}/>,
            })));
        }

        if (useSpecialMentions) {
            results.push(...Constants.SPECIAL_MENTIONS.filter((special) => special.startsWith(query.toLowerCase())).map((special) => ({
                id: special,
                type: 'special',
                label: special,
                content: <SpecialMentionItem name={special}/>,
            })));
        }

        // add all users to the result that are not a member of this channel
        if (Array.isArray(userNotInChannel) && userNotInChannel.length > 0) {
            results.push(...userNotInChannel.map((user) => ({
                id: user.id,
                type: 'nonmembers',
                label: user.username,
                content: <UserMentionItem {...user}/>,
            })));
        }

        return results;
    },

    render,
});
