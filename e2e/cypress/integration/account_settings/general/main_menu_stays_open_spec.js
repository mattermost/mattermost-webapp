// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings > General', () => {
    let otherUser;
    let testChannel;

    before(() => {
        cy.apiInitSetup().then(({team, channel}) => {
            testChannel = channel;

            cy.apiCreateUser().then(({user}) => {
                otherUser = user;

                cy.apiAddUserToTeam(team.id, user.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, user.id);
                });
            });

            // # Go to town square
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T285 Main Menu stays open', () => {
        // # Click the hamburger button
        cy.get('#headerInfo').find('button').click({force: true});

        // * Menu should be visible
        cy.get('#sidebarDropdownMenu').find('.dropdown-menu').should('be.visible');

        // # Post a message as other user and wait for it to reach
        cy.postMessageAs({sender: otherUser, message: 'abc', channelId: testChannel.id}).wait(TIMEOUTS.FIVE_SEC);

        // * Menu should still be visible
        cy.get('#sidebarDropdownMenu').find('.dropdown-menu').should('be.visible');
    });
});
