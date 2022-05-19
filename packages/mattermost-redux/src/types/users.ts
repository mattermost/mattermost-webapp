// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PostType} from '@mattermost/types/posts';
import {UserProfile} from '@mattermost/types/users';

export * from '@mattermost/types/users';

export type UserActivity = {
    [postType in PostType]: {
        [userId in UserProfile['id']]: | {
            ids: Array<UserProfile['id']>;
            usernames: Array<UserProfile['username']>;
        } | Array<UserProfile['id']>;
    };
};
