// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @multi_team_and_dm

describe('Integrations', () => {
    let userA;
    let testChannel;

    before(() => {
        // # Setup with the new team, channel and user
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            userA = user;
            console.log(testChannel.name)
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T439 Town Square is not marked as unread for existing users when a new user is added to the team', () => {
        const unreadChannel = `channel ${testChannel.name} public channel unread`;
        const readChannel = `channel ${testChannel.name} public channel`;
        
        // # Disable join/ leave messages for user A
        cy.apiLogin(userA);
        cy.findByLabelText('main menu').click();
        cy.get('#accountSettings').click();
        cy.findByLabelText('advanced').click();
        cy.get('#joinLeaveDesc').click();
        cy.get('#joinLeaveOff').click();
        cy.get('#accountSettingsHeader > .close > [aria-hidden="true"]').click();

        // # Confirm created channel and Town Square are read
        cy.get('#sidebarItem_town-square').should('not.have', 'attr', 'aria-label', 'town square public channel unread').should('have.attr', 'aria-label', 'town square public channel');
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.get(`#sidebarItem_${testChannel.name}`).should('not.have', 'attr', 'aria-label', unreadChannel)//.should('have.attr', 'aria-label', readChannel);
        
        // # Remove focus from Town Square and public channel
        cy.get('#sidebarItem_off-topic').click();

        // # Create 2nd user and add to Town Square and public channel
        cy.apiAdminLogin().then(() => {
            cy.apiCreateUser().then(({user: userB}) => {
                cy.apiAddUserToTeam(testTeam.id, userB.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, userB.id);
                });
            });
        });

        // # Log in as first user and assert Town Square and public channel are still marked as un-read
        cy.apiLogin(userA).then(() => {
            cy.get('#sidebarItem_town-square').should('not.have', 'attr', 'aria-label', 'town square public channel unread').should('have.attr', 'aria-label', 'town square public channel');
            cy.get(`#sidebarItem_${testChannel.name}`).should('not.have', 'attr', 'aria-label', unreadChannel) //.should('have.attr', 'aria-label', readChannel);
        })
    });
});
