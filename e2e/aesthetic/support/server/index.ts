// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '../../../../packages/mattermost-redux/src/types/users';

import testConfig from '../../test.config';

import {createRandomChannel} from './channel';
import Client4 from './client4';
import {getOnPremServerConfig} from './default_config';
import {initSetup, getAdminClient} from './init';
import {getPreferenceWithHideInVisualTesting} from './preference';
import {createRandomTeam} from './team';
import {createRandomUser} from './user';

type UserRequest = {
    username?: string;
    email?: string;
    password: string;
};

const clients = {};

export async function makeClient(
    userRequest: UserRequest,
    useCache = true
): Promise<{
    client: Client4;
    user: UserProfile;
}> {
    try {
        const cacheKey = userRequest.username + userRequest.password;
        if (useCache && clients[cacheKey] != null) {
            return clients[cacheKey];
        }

        const client = new Client4();
        client.setUrl(testConfig.baseURL);
        const {data} = await client.login(userRequest.username, userRequest.password);
        const user = {...data, password: userRequest.password};

        if (useCache) {
            clients[cacheKey] = {client, user};
        }

        return {client, user};
    } catch (err) {
        console.log(err);
    }
}

export {
    createRandomChannel,
    Client4,
    getOnPremServerConfig,
    initSetup,
    getAdminClient,
    getPreferenceWithHideInVisualTesting,
    createRandomTeam,
    createRandomUser,
};
