// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Client4 from 'mattermost-redux/client/client4';

import clientRequest from '../plugins/client_request';

class E2EClient extends Client4 {
    doFetchWithResponse = async (url, options) => {
        const {
            body,
            headers,
            method,
        } = this.getOptions(options);

        let data;
        if (body) {
            data = JSON.parse(body);
        }

        const response = await clientRequest({
            headers,
            url,
            method,
            data,
        });

        if (url.endsWith('/api/v4/users/login')) {
            this.setToken(response.headers.token);
            this.setUserId(response.data.id);
            this.setUserRoles(response.data.roles);
        }
        return response;
    }
}

Cypress.Commands.add('makeClient', async ({user}) => {
    const client = new E2EClient();

    const baseUrl = Cypress.config('baseUrl');
    client.setUrl(baseUrl);

    await client.login(user.username, user.password);
    return client;
});
