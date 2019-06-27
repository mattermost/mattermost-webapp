// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {UserSearchOptions, SearchUserOptionsFilter} from 'utils/constants.jsx';

export function getFilterOptions(filter) {
    const options = {};
    if (filter === SearchUserOptionsFilter.SYSTEM_ADMIN) {
        options[UserSearchOptions.ROLE] = SearchUserOptionsFilter.SYSTEM_ADMIN;
    } else if (filter === SearchUserOptionsFilter.SYSTEM_GUEST) {
        options[UserSearchOptions.ROLE] = SearchUserOptionsFilter.SYSTEM_GUEST;
    } else if (filter === SearchUserOptionsFilter.ALLOW_INACTIVE) {
        options[SearchUserOptionsFilter.ALLOW_INACTIVE] = true;
    }
    return options;
}
