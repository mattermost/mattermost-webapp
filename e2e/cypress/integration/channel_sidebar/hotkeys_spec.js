// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import {getRandomId} from '../../utils';
import {getAdminAccount} from '../../support/env';

describe('Channel switching', () => {
    const sysadmin = getAdminAccount();

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    const cmdOrCtrl = Cypress.platform === 'darwin' ? '{cmd}' : '{ctrl}';

    it('should switch channels when pressing the alt + arrow hotkeys', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        // # Press alt + up
        cy.get('body').type('{alt}', {release: false}).type('{uparrow}').type('{alt}', {release: true});

        // * Verify that the channel changed to the Off-Topic channel
        cy.url().should('include', `/${teamName}/channels/off-topic`);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Press alt + down
        cy.get('body').type('{alt}', {release: false}).type('{downarrow}').type('{alt}', {release: true});

        // * Verify that the channel changed to the Town Square
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');
    });

    it('should switch to unread channels when pressing the alt + shift + arrow hotkeys', () => {
        // # Start with a new team
        const teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);

        // # Create a new channel
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'test-channel', 'Test Channel').then(({channel}) => {
                // # Have another user post a message in the new channel
                cy.reload();
                cy.postMessageAs({sender: sysadmin, message: 'Test', channelId: channel.id});
            });
        });

        // * Verify that we've switched to the new team
        cy.get('#headerTeamName').should('contain', teamName);

        cy.getCurrentChannelId().as('townSquareId');

        // # Press alt + shift + up
        cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});

        // * Verify that the channel changed to Test Channel and skipped Off Topic
        cy.url().should('include', `/${teamName}/channels/test-channel`);
        cy.get('#channelHeaderTitle').should('contain', 'Test Channel');

        // # Have another user post a message in the town square
        cy.get('@townSquareId').then((townSquareId) => cy.postMessageAs({sender: sysadmin, message: 'Test', channelId: townSquareId}));

        // # Press alt + shift + down
        cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});

        // * Verify that the channel changed back to Town Square and skipped Off Topic
        cy.url().should('include', `/${teamName}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('contain', 'Town Square');
    });

    it('should open and close channel switcher on ctrl/cmd + k', () => {
        // * Verify that the channel has loaded
        cy.get('#channelHeaderTitle').should('be.visible');

        // # Press ctrl/cmd + k
        cy.get('body').type(cmdOrCtrl, {release: false}).type('k').type(cmdOrCtrl, {release: true});

        // * Verify that the modal has been opened
        cy.get('.channel-switcher').should('be.visible');

        // # Press ctrl/cmd + k
        cy.get('body').type(cmdOrCtrl, {release: false}).type('k').type(cmdOrCtrl, {release: true});

        // * Verify that the modal has been closed
        cy.get('.channel-switcher').should('not.be.visible');
    });
});
