// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// this patches the wrong type definition in node_modules/mattermost-redux/src/types/admin.ts

import {AdminState} from 'mattermost-redux/src/types/admin';
import {Dictionary, RelationOneToOne} from 'mattermost-redux/src/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {UserAccessToken} from 'mattermost-redux/src/types/users';

export type AdminTokenState = AdminState & {

    // userAccessTokensForUser in definition rather than userAccessTokensByUser
    userAccessTokensByUser?: RelationOneToOne<UserProfile, Dictionary<UserAccessToken>>;
};
