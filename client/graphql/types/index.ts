// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {User} from '../types/user';
import {Config} from '../types/config';
import {TeamMember} from '../types/teamMembers';

export interface ApiGraphQLTypes {
    user: User;
    config: Config;
    license: Record<string, string>;
    teamMembers: TeamMember[];
}
