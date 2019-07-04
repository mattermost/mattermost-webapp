// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

let testTeam;

describe('Message Draft', () => {
    before(() => {
        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                testTeam = response.body;
                cy.visit(`/${testTeam.name}`);
            });
        });
    });

    it('M13473 Message Draft - Pencil Icon', () => {
        // # Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);

        // * Validate if the draft icon is not visible on the sidebar before making a draft
        cy.get('#publicChannel').scrollIntoView();
        cy.get('#sidebarItem_town-square #draftIcon').should('be.not.visible');

        // # Type in some text into the text area of the opened channel
        cy.get('#post_textbox').type('comm');

        // # Go to another test channel without submitting the draft in the previous channel
        cy.get('#sidebarItem_off-topic').click({force: true});

        // * Validate if the newly navigated channel is open
        cy.url().should('include', `/${testTeam.name}/channels/off-topic`);

        // * Validate if the draft icon is visible on side bar on the previous channel with a draft
        cy.get('#sidebarItem_town-square #draftIcon').should('be.visible');
    });
});
