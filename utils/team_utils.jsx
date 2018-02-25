// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import LocalizationStore from 'stores/localization_store.jsx';

// Use when sorting multiple teams by their `display_name` field
function sortTeamsByDisplayName(a, b) {
    const locale = LocalizationStore.getLocale();

    if (a.display_name !== b.display_name) {
        return a.display_name.localeCompare(b.display_name, locale, {numeric: true});
    }

    return a.name.localeCompare(b.name, locale, {numeric: true});
}

// Use to filter out teams that are deleted and without display_name, then sort by their `display_name` field
export function filterAndSortTeamsByDisplayName(teams = []) {
    if (!teams) {
        return [];
    }

    return teams.
        filter((team) => {
            return team && !team.delete_at > 0 && team.display_name != null;
        }).
        sort(sortTeamsByDisplayName);
}
