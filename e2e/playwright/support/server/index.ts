// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '../../../../packages/mattermost-redux/src/types/users';

import testConfig from '../../test.config';

import {createRandomChannel} from './channel';
import Client from './client';
import {getOnPremServerConfig} from './default_config';
import {initSetup, getAdminClient} from './init';
import {createRandomTeam} from './team';
import {createRandomUser, getDefaultAdminUser} from './user';

type UserRequest = {
    username?: string;
    email?: string;
    password: string;
};

const clients = {};

export async function makeClient(
    userRequest?: UserRequest,
    useCache = true
): Promise<{
    client?: Client;
    user?: UserProfile;
    err?: string;
}> {
    try {
        const client = new Client();
        client.setUrl(testConfig.baseURL);

        if (!userRequest) {
            return {client};
        }

        const cacheKey = userRequest.username + userRequest.password;
        if (useCache && clients[cacheKey] != null) {
            return clients[cacheKey];
        }

        const {data} = await client.login(userRequest.username, userRequest.password);
        const user = {...data, password: userRequest.password};

        if (useCache) {
            clients[cacheKey] = {client, user};
        }

        return {client, user};
    } catch (err) {
        return {err};
    }
}

export {
    createRandomChannel,
    Client,
    getOnPremServerConfig,
    initSetup,
    getAdminClient,
    createRandomTeam,
    createRandomUser,
    getDefaultAdminUser,
};
