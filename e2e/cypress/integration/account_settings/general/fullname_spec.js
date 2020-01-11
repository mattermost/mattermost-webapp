// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
import {getRandomInt} from '../../../utils';

describe('Account Settings > Sidebar > General', () => {
    // # number to identify particular user
    const uniqueNumber = getRandomInt(1000);
    before(() => {
        cy.apiLogin('user-2');
        cy.visit('/ad-1/channels/town-square');

        cy.getCurrentTeamId().then((teamId) => {
            cy.loginAsNewUser({}, [teamId]).as('newuser');

            // # Go to Account Settings as new user
            cy.toAccountSettingsModal(null, true);

            // # Click General button
            cy.get('#generalButton').click();

            // # Open Full Name section
            cy.get('#nameDesc').click();

            // * Set first name value
            cy.get('#firstName').clear().type(`정트리나${uniqueNumber}/trina.jung/집단사무국(CO)`);

            // # save form
            cy.get('#saveSetting').click();
        });
    });

    it('M17459 - Filtering by first name with Korean characters', () => {
        cy.apiLogin('user-2');
        cy.get('@newuser').then((user) => {
            cy.visit('/ad-1/channels/town-square');

            // # type in user`s firstName substring
            cy.get('#post_textbox').clear().type(`@정트리나${uniqueNumber}`);

            // * verify that suggestion list is visible and has value
            cy.get('.suggestion-list__divider').
                find('span').
                last().
                should('be.visible').
                and('have.text', 'Channel Members');

            // * verify that user listed in popup
            cy.get('.mention--align').
                should('be.visible').
                and('have.text', `@${user.username}`);

            // # Press tab on text input
            cy.get('#post_textbox').tab();

            // # verify that after enter user`s username match
            cy.get('#post_textbox').should('have.value', `@${user.username} `);

            // # click enter in chat input
            cy.get('#post_textbox').type('{enter}');

            // # verify that message has been post in chat
            cy.get(`[data-mention="${user.username}"]`).
                last().
                scrollIntoView().
                should('be.visible');
        });
    });
});
