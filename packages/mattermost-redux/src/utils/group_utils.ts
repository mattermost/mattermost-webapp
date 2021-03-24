// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {General} from '../constants';
import {Group} from 'mattermost-redux/types/groups';

import {getSuggestionsSplitByMultiple} from './user_utils';

export function filterGroupsMatchingTerm(groups: Group[], term: string): Group[] {
    const lowercasedTerm = term.toLowerCase();
    let trimmedTerm = lowercasedTerm;
    if (trimmedTerm.startsWith('@')) {
        trimmedTerm = trimmedTerm.substr(1);
    }

    return groups.filter((group: Group) => {
        if (!group) {
            return false;
        }

        const groupSuggestions: string[] = [];

        const groupnameSuggestions = getSuggestionsSplitByMultiple((group.name || '').toLowerCase(), General.AUTOCOMPLETE_SPLIT_CHARACTERS);

        groupSuggestions.push(...groupnameSuggestions);
        const displayname = (group.display_name || '').toLowerCase();
        groupSuggestions.push(displayname);

        return groupSuggestions.
            filter((suggestion) => suggestion !== '').
            some((suggestion) => suggestion.startsWith(trimmedTerm));
    });
}
