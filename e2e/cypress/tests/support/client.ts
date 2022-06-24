// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAdminAccount, User} from './env';

import {E2EClient} from './client-impl';

const clients = {};

interface Arg{
    user?: User;
    useCache?: boolean;
}
async function makeClient(arg: Arg = {}) {
    const {user = getAdminAccount(), useCache = true} = arg;
    const cacheKey = user.username + user.password;
    if (useCache && clients[cacheKey] != null) {
        return clients[cacheKey];
    }

    const client = new E2EClient();

    const baseUrl = Cypress.config('baseUrl');
    client.setUrl(baseUrl);

    await client.login(user.username, user.password);

    if (useCache) {
        clients[cacheKey] = client;
    }

    return client;
}

Cypress.Commands.add('makeClient', makeClient);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            makeClient(options?: {user: Pick<UserProfile, 'username' | 'password'>}): Chainable<Client>;
        }
    }
}
