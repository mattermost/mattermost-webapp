// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

import {getRandomId} from '../../../utils';

describe('Account Settings > username', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let testChannel;

    before(() => {
        cy.apiInitSetup().then(({user, team, channel}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });

        cy.apiCreateUser({prefix: 'az1'}).then(({user}) => {
            otherUser = user;
            cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                cy.apiAddUserToChannel(testChannel.id, otherUser.id).then(() => {
                    cy.apiLogin(testUser);
                });
            });
        });
    });

    it('MM-T2056 Username changes when viewed by other user', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Post a message in town-square
        cy.postMessage('Testing username update');
        cy.apiLogout();

        // # Login as other user
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # get last post in town-square for verifying username
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                // # Open profile popover
                cy.get('.user-popover').click();
            });

            // * Verify username in profile popover
            cy.get('#user-profile-popover').within(() => {
                cy.get('.user-popover__username').should('be.visible').and('contain', `${testUser.username}`);
            });
        });

        cy.apiLogout();

        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open account settings modal
        cy.toAccountSettingsModal();

        // # Open Full Name section
        cy.get('#usernameDesc').click();

        const randomId = getRandomId();

        // # Save username with a randomId
        cy.get('#username').clear().type(`${otherUser.username}-${randomId}`);

        // # save form
        cy.get('#saveSetting').click();

        cy.apiLogout();
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # get last post in town-square for verifying username
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.get('.user-popover').click();
            });

            // * Verify that new username is in profile popover
            cy.get('#user-profile-popover').within(() => {
                cy.get('.user-popover__username').should('be.visible').and('contain', `${otherUser.username}-${randomId}`);
            });
        });
    });
});
