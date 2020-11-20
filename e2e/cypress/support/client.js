// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Client4 from 'mattermost-redux/client/client4';

class E2EClient extends Client4 {
    doFetchWithResponse = async (url, options) => {
        const {
            body,
            headers,
            method,
        } = this.getOptions(options);

        const data = JSON.parse(body);

        return new Promise((resolve) => {
            cy.task('clientRequest', {
                data,
                headers,
                method,
                url,
            }).then((response) => {
                if (url.endsWith('/api/v4/users/login')) {
                    this.setToken(response.headers.token);
                    this.setUserId(response.data.id);
                    this.setUserRoles(response.data.roles);
                }

                resolve(response);
            });
        });
    }
}

Cypress.Commands.add('makeClient', ({user}) => {
    const client = new E2EClient();

    const baseUrl = Cypress.config('baseUrl');
    client.setUrl(baseUrl);

    client.login(user.username, user.password).then(() => {
        cy.wrap(client);
    });
});
