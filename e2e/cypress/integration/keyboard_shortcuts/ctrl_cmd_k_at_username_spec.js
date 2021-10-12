// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts


describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        cy.apiLogin(testUser);
    });
    it('MM-T1246 CTRL/CMD+K - @ at beginning of username', () => {
        
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('k');

        // # Enter @ followed by the first 2 characters of username of the other user
        cy.get('#quickSwitchInput').type('@'+otherUser.username.slice(0,3))

        // # Click on the username in the suggestion list
        cy.findByTestId(`${otherUser.username}`).click()

        // * the direct message channel for the user opens
        cy.url().should('include', `/${testTeam.name}/messages/@${otherUser.username}`);
    });
});
