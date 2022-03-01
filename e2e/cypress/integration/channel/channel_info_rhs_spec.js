// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel @rhs @channel_info

import {stubClipboard} from '../../utils';

describe('Channel Info RHS', () => {
    let testTeam;
    let testChannel;
    let groupChannel;
    let directUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;

            cy.apiCreateChannel(testTeam.id, 'channel', 'Public Channel', 'O').then(({channel}) => {
                testChannel = channel;
                cy.apiAddUserToChannel(channel.id, user.id);
            });

            cy.apiCreateUser().then(({user: newUser}) => {
                cy.apiAddUserToTeam(team.id, newUser.id);

                cy.apiCreateDirectChannel([user.id, newUser.id]).then(() => {
                    directUser = newUser;
                });

                cy.apiCreateUser().then(({user: newUser2}) => {
                    cy.apiAddUserToTeam(team.id, newUser.id);
                    cy.apiCreateGroupChannel([user.id, newUser.id, newUser2.id]).then(({channel}) => {
                        groupChannel = channel;
                    });
                });
            });

            cy.apiLogin(user);

            // # Visit town-square channel
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('should be able to open the RHS', () => {
        // # Go to test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click on the channel info button
        cy.get('#channel-info-btn').click();

        // * RHS Container shoud exist
        cy.get('#rhsContainer').then((rhsContainer) => {
            cy.wrap(rhsContainer).findByText('Info').should('be.visible');
            cy.wrap(rhsContainer).findByText(testChannel.display_name).should('be.visible');
        });
    });

    describe('regular channel', () => {
        it('should be able to toggle favorite on a channel', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that we can toggle the favorite status
            cy.uiGetRHS().findByText('Favorite').should('be.visible').click();
            cy.uiGetRHS().findByText('Favorited').should('be.visible').click();
            cy.uiGetRHS().findByText('Favorite').should('be.visible');
        });

        it('should be able to toggle mute on a channel', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that we can toggle the mute status
            cy.uiGetRHS().findByText('Mute').should('be.visible').click();
            cy.uiGetRHS().findByText('Muted').should('be.visible').click();
            cy.uiGetRHS().findByText('Mute').should('be.visible');
        });

        it('should be able to app people', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that the modal appears
            cy.uiGetRHS().findByText('Add People').should('be.visible').click();
            cy.get('.channel-invite').should('be.visible');
        });

        it('should be able to copy link', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            stubClipboard().as('clipboard');

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify initial state
            cy.get('@clipboard').its('contents').should('eq', '');

            // # Click on "Copy Link"
            cy.uiGetRHS().findByText('Copy Link').parent().should('be.visible').trigger('click');

            // * Text should change to Copied
            cy.uiGetRHS().findByText('Copied').should('be.visible');

            // * Verify if it's called with correct link value
            cy.get('@clipboard').its('contents').should('eq', `${Cypress.config('baseUrl')}/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    describe('group channel', () => {
        it('should be able to toggle favorite', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/${groupChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that we can toggle the favorite status
            cy.uiGetRHS().findByText('Favorite').should('be.visible').click();
            cy.uiGetRHS().findByText('Favorited').should('be.visible').click();
            cy.uiGetRHS().findByText('Favorite').should('be.visible');
        });

        it('should be able to toggle mute', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/${groupChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that we can toggle the mute status
            cy.uiGetRHS().findByText('Mute').should('be.visible').click();
            cy.uiGetRHS().findByText('Muted').should('be.visible').click();
            cy.uiGetRHS().findByText('Mute').should('be.visible');
        });

        it('should be able to app people', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/${groupChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that the modal appears
            cy.uiGetRHS().findByText('Add People').should('be.visible').click();
            cy.get('.channel-invite').should('be.visible');
        });

        it('should NOT be able to copy link', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/${groupChannel.name}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // # Click on "Copy Link"
            cy.uiGetRHS().get('Copy Link').should('not.exist');
        });
    });

    describe('direct channel', () => {
        it('should be able to toggle favorite', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/@${directUser.username}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that we can toggle the favorite status
            cy.uiGetRHS().findByText('Favorite').should('be.visible').click();
            cy.uiGetRHS().findByText('Favorited').should('be.visible').click();
            cy.uiGetRHS().findByText('Favorite').should('be.visible');
        });

        it('should be able to toggle mute', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/@${directUser.username}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that we can toggle the mute status
            cy.uiGetRHS().findByText('Mute').should('be.visible').click();
            cy.uiGetRHS().findByText('Muted').should('be.visible').click();
            cy.uiGetRHS().findByText('Mute').should('be.visible');
        });

        it('should NOT be able to add people', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/@${directUser.username}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // * Verify that the modal appears
            cy.uiGetRHS().findByText('Add People').should('not.exist');
        });

        it('should NOT be able to copy link', () => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/messages/@${directUser.username}`);

            // # Click on the channel info button
            cy.get('#channel-info-btn').click();

            // # Click on "Copy Link"
            cy.uiGetRHS().get('Copy Link').should('not.exist');
        });
    });
});
