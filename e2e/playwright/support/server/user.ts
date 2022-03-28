// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '../../../../packages/mattermost-redux/src/types/users';
import testConfig from '../../test.config';

import {getRandomId} from '../utils';

export function createRandomUser(prefix = 'user') {
    const randomId = getRandomId();

    const user = {
        email: `${prefix}${randomId}@sample.mattermost.com`,
        username: `${prefix}${randomId}`,
        password: 'passwd',
        first_name: `First${randomId}`,
        last_name: `Last${randomId}`,
        nickname: `Nickname${randomId}`,
    };

    return user as UserProfile;
}

export function getDefaultAdminUser() {
    const admin = {
        username: testConfig.adminUsername,
        password: testConfig.adminPassword,
        first_name: 'Kenneth',
        last_name: 'Moreno',
        email: testConfig.adminEmail,
    };

    return admin as UserProfile;
}
