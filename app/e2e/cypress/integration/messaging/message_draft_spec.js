// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Message Draft', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T130 Message Draft Pencil Icon- Text', () => {
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
