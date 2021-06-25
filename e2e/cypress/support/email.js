// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getEmailUrl, splitEmailBodyText} from '../utils';

/**
* getRecentEmail is a task to get email from email service provider
* @param {string} username - username of the user
* @param {string} username - email of the user
*/
Cypress.Commands.add('getRecentEmail', ({username, email}) => {
    return cy.task('getRecentEmail', {username, email, mailUrl: getEmailUrl()}).then(({status, data}) => {
        expect(status).to.equal(200);

        const {to, date, body: {text}} = data;

        // * Verify that email is addressed to a user
        expect(to.length).to.equal(1);
        expect(to[0]).to.contain(email);

        // * Verify that date is current
        const isoDate = new Date().toISOString().substring(0, 10);
        expect(date).to.contain(isoDate);

        const body = splitEmailBodyText(text);
        return cy.wrap({...data, body});
    });
});
