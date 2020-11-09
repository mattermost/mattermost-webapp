// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @modals
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Quick switcher', () => {
    let testTeam;
    let testUser;
    let firstUser;
    let secondUser;
    let thirdUser;
    let testChannel;

    before(() => {
        // # create three users for testing
        cy.apiInitSetup().then(({user, team, channel}) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
        cy.apiCreateUser({prefix: 'az1'}).then(({user: user1}) => {
            firstUser = user1;
        });

        cy.apiCreateUser({prefix: 'az2'}).then(({user: user1}) => {
            secondUser = user1;
        });

        cy.apiCreateUser({prefix: 'az3'}).then(({user: user1}) => {
            thirdUser = user1;
        });
    });

    it('MM-T3447_1 Should add recent user on top of results', () => {
        cy.apiLogout();

        // # Login as test user
        cy.apiLogin(testUser);

        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Type either cmd+K / ctrl+K depending on OS
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // # This is to remove the unread channel created on apiInitSetup
        cy.focused().type(testChannel.display_name).wait(TIMEOUTS.HALF_SEC).type('{enter}');

        cy.postMessage('Testing quick switcher');

        // # Go to the DM channel of second user
        cy.goToDm(secondUser.username);

        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // # Search with the term a
        cy.focused().type('a');

        // * Should have recently interacted DM on top
        cy.get('.suggestion--selected').should('exist').and('contain.text', secondUser.username);

        // # Close quick switcher
        cy.get('body').type('{esc}', {force: true});
    });

    it('MM-T3447_2 Should add latest interacted user on top of results instead of alphabetical order', () => {
        // # Go to the DM channel of third user
        cy.goToDm(thirdUser.username);

        // # Type either cmd+K / ctrl+K depending on OS
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // # Search with the term a
        cy.focused().type('a');

        // * Should have recently interacted DM on top
        cy.get('.suggestion--selected').should('exist').and('contain.text', thirdUser.username);

        // # Close quick switcher
        cy.get('body').type('{esc}', {force: true});
        cy.postMessage('Testing quick switcher');

        // # Go to the DM channel of second user
        cy.goToDm(secondUser.username);

        cy.get('#post_textbox').cmdOrCtrlShortcut('K');
        cy.focused().type('a');

        // * Should have recently interacted DM on top
        cy.get('.suggestion--selected').should('exist').and('contain.text', secondUser.username);
        cy.get('body').type('{esc}', {force: true});
    });

    it('MM-T3447_3 Should match interacted users even with a partial match', () => {
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // # Search with the term z2
        cy.focused().type('z2');

        // Should match second user as it has a partial match with the search term
        cy.get('.suggestion--selected').should('exist').and('contain.text', secondUser.username);

        cy.get('body').type('{esc}', {force: true});
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // # Search with the term z3
        cy.focused().type('z3');

        // Should match third user as it has a partial match with the search term
        cy.get('.suggestion--selected').should('exist').and('contain.text', thirdUser.username);
        cy.get('body').type('{esc}', {force: true});
    });

    it('MM-T3447_4 Should not match GM if it is removed from LHS', () => {
        cy.apiCreateGroupChannel([testUser.id, firstUser.id, secondUser.id]).then(({channel}) => {
            // # Visit the newly created group message
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            cy.get('#post_textbox').cmdOrCtrlShortcut('K');
            cy.focused().type('a');

            // * Should have recently interacted GM on top, Matching as Gaz because we have G prefixed for GM's
            cy.get('.suggestion--selected').should('exist').and('contain.text', 'Gaz');
            cy.get('body').type('{esc}', {force: true});

            // # Open the channel dropdown menu
            cy.get('#channelHeaderDropdownButton').click();

            // # Click on 'Close group message' menu item
            cy.get('#channelCloseMessage').click().wait(TIMEOUTS.HALF_SEC);

            cy.get('#post_textbox').cmdOrCtrlShortcut('K');
            cy.focused().type('a');

            // * Should have recently interacted DM on top
            cy.get('.suggestion--selected').should('exist').and('contain.text', thirdUser.username);
        });
    });
});
