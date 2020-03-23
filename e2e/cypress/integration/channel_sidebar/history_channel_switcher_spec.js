// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users';

import {testWithConfig} from '../../support/hooks';

import {getRandomInt} from '../../utils';

const sysadmin = users.sysadmin;

describe('Channel sidebar', () => {
    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'default_on',
        },
    });

    before(() => {
        Cypress.config('userAgent', 'Mattermost/Electron');

        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('should go back and forth in history when clicking on the back/forward button', () => {
        // # Start with a new team
        const teamName = `team-${getRandomInt(999999)}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Click on Off Topic
        cy.get('.SidebarChannel:contains(Off-Topic)').should('be.visible').click();

        // * Verify that the channel changed
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Click the Back button
        cy.get('.SidebarChannelNavigator_backButton').should('be.visible').click();

        // * Verify that the channel changed back to Town Square
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');

        // # Click the Forward button
        cy.get('.SidebarChannelNavigator_backButton').should('be.visible').click();

        // * Verify that the channel changed back to Off-Topic
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');
    });
});
