// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';

import testConfig from '@e2e-test.config';

import {createRandomChannel} from './channel';
import Client from './client';
import {getOnPremServerConfig} from './default_config';
import {initSetup, getAdminClient} from './init';
import {createRandomTeam} from './team';
import {createRandomUser, getDefaultAdminUser} from './user';

type UserRequest = {
    username: string;
    email?: string;
    password: string;
};

type ClientCache = {
    client: Client | null;
    user: UserProfile | null;
    err?: any;
};

const clients: Record<string, ClientCache> = {};

export async function makeClient(userRequest?: UserRequest, useCache = true): Promise<ClientCache> {
    try {
        const client = new Client();
        client.logToConsole = false;
        client.setUrl(testConfig.baseURL);

        if (!userRequest) {
            return {client, user: null};
        }

        const cacheKey = userRequest.username + userRequest.password;
        if (useCache && clients[cacheKey] != null) {
            return clients[cacheKey];
        }

        const userProfile = await client.login(userRequest.username, userRequest.password);
        const user = {...userProfile, password: userRequest.password};

        if (useCache) {
            clients[cacheKey] = {client, user};
        }

        return {client, user};
    } catch (err) {
        return {client: null, user: null, err};
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
