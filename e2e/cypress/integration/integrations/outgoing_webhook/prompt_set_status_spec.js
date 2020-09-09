// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @outgoing_webhook

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Prompting set status', () => {
    let user1;
    let user2;
    let testChannelUrl;
    before(() => {
        cy.apiInitSetup().then(({user, team}) => {
            user1 = user;
            testChannelUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;

                cy.apiAddUserToTeam(team.id, user2.id);
            });
        });
    });

    it('MM-T673 Prompting to set status to online', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);
        cy.get('img.Avatar').click();
        cy.findByText('Online').click();

        // # Use the status drop-down on your profile pic to go Offline
        cy.get('img.Avatar').click();
        cy.findByText('Offline').click();

        // * Your status stays offline in your view
        cy.get('.offline--icon').should('be.visible');
        cy.get('.online--icon').should('not.be.visible');

        // # Log out
        cy.apiLogout();

        cy.apiLogin(user2);
        cy.visit(testChannelUrl);
        openDM(user1.username);

        // * Your status stays offline in other users' views.
        cy.get('#channelHeaderInfo').within(() => {
            cy.get('.offline--icon').should('be.visible');
            cy.get('.online--icon').should('not.be.visible');
            cy.findByText('Offline').should('be.visible');
        });
        cy.apiGetUserStatus(`${user1.id}`).then((result) => {
            cy.wrap(result.status.status).should('be.equal', 'offline');
        });

        // # Log back in
        cy.apiLogin(user1);
        cy.visit(testChannelUrl);

        // # On modal that asks if you want to be set Online, select No.
        cy.get('.modal-content').within(() => {
            cy.findByText('Your Status is Set to "Offline"').should('be.visible');
            cy.get('#cancelModalButton').click();
        });

        // * Your status stays offline in your view
        cy.get('.offline--icon').should('be.visible');
        cy.get('.online--icon').should('not.be.visible');

        // * Your status stays offline in other users' views.
        cy.apiLogin(user2);
        cy.visit(testChannelUrl);
        openDM(user1.username);

        // * Your status stays offline in other users' views.
        cy.get('#channelHeaderInfo').within(() => {
            cy.get('.offline--icon').should('be.visible');
            cy.get('.online--icon').should('not.be.visible');
            cy.findByText('Offline').should('be.visible');
        });
        cy.apiGetUserStatus(`${user1.id}`).then((result) => {
            cy.wrap(result.status.status).should('be.equal', 'offline');
        });
    });
});

const openDM = (username) => {
    cy.get('#addDirectChannel').click();
    cy.get('#selectItems').type(`${username}`);
    cy.wait(TIMEOUTS.ONE_SEC);
    cy.get('#multiSelectList').findByText(`@${username}`).click();
    cy.get('#selectItems').findByText(`${username}`).should('be.visible');
    cy.findByText('Go').click();
};
