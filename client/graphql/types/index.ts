// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {User} from '../types/user';
import {License} from '../types/license';
import {Config} from '../types/config';
import {TeamMember} from '../types/teamMembers';

export interface ApiGraphQLTypes {
    user: User;
    license: License;
    config: Config;
    teamMembers: TeamMember[];
}
