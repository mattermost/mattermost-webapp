// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Header', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('M13564 Ellipsis indicates the channel header is too long', () => {
        // 2. Open channel header textbox
        cy.get('#channelHeaderDropdownButton').should('be.visible').click();
        cy.get('#channelHeaderDropdownMenu').should('be.visible').find('#channelEditHeader').click();

        // 3. Enter short description
        cy.get('#edit_textbox').clear().type('> newheader').type('{enter}').wait(500);

        // * Check if channel header description has no ellipsis
        cy.get('#channelHeaderDescription').ellipsis(false);

        // 4. Open channel header textbox
        cy.get('#channelHeaderDropdownButton').should('be.visible').click();
        cy.get('#channelHeaderDropdownMenu').should('be.visible').find('#channelEditHeader').click();

        // 5. Enter long description
        cy.get('#edit_textbox').clear().type('>').type(' newheader'.repeat(20)).type('{enter}').wait(500);

        // * Check if channel header description has ellipsis
        cy.get('#channelHeaderDescription').ellipsis(true);
    });
});
