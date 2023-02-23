// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';

import testConfig from '@e2e-test.config';

import {shouldHaveBoardsEnabled} from './boards';
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
    client: Client;
    user: UserProfile | null;
};

const clients: Record<string, ClientCache> = {};

export async function makeClient(userRequest?: UserRequest, useCache = true): Promise<ClientCache> {
    const client = new Client();
    client.setUrl(testConfig.baseURL);

    try {
        if (!userRequest) {
            return {client, user: null};
        }

        const cacheKey = userRequest.username + userRequest.password;
        if (useCache && clients[cacheKey] != null) {
            return clients[cacheKey];
        }

        const userProfile = await client.login(userRequest.username, userRequest.password);
        const user = {...userProfile, password: userRequest.password};
        const config = await client.getClientConfigOld();
        client.setUseBoardsProduct(config.FeatureFlagBoardsProduct === 'true');

        if (useCache) {
            clients[cacheKey] = {client, user};
        }

        return {client, user};
    } catch (err) {
        // log an error for debugging
        // eslint-disable-next-line no-console
        console.log('makeClient', err);
        return {client, user: null};
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
    shouldHaveBoardsEnabled,
};
