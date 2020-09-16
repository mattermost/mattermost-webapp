// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            // # Visit a test channel
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });
    it('M23345 - Inline markdown images open preview window', () => {
        // # Enable 'Show markdown preview option in message input box' setting in Account Settings > Advanced
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#advancedButton').click();
        cy.get('#advancedPreviewFeaturesDesc').click();
        cy.get('#advancedPreviewFeaturesmarkdown_preview').check().should('be.checked');
        cy.get('#saveSetting').click();
        cy.reload();

        // # Post the image link to the channel
        cy.get('[data-testid=post_textbox]').type('![test image](https://www.mattermost.org/wp-content/uploads/2016/03/logoHorizontal.png){enter}');
        cy.reload();

        // # Hover over image then click to open preview image
        cy.get('.file-preview__button').trigger('mouseover').click();

        // * Confirm image container is visible
        cy.get('.markdown-inline-img__container').should('be.visible');
        
        // * Confirm image is visible
        cy.get('[data-testid=imagePreview]').should('be.visible');
    });
});
