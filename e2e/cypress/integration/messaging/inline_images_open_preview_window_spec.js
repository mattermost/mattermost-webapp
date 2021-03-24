// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            // # Visit a test channel
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T187 Inline markdown images open preview window', () => {
        // # Open 'Advanced' section of 'Account Settings' modal
        cy.uiOpenAccountSettingsModal('Advanced').within(() => {
            // # Open 'Preview Pre-release Features' setting and check 'Show markdown preview option in message input box'
            cy.findByRole('heading', {name: 'Preview Pre-release Features'}).should('be.visible').click();
            cy.findByRole('checkbox', {name: 'Show markdown preview option in message input box'}).click().should('be.checked');

            // # Save and close the modal
            cy.uiSaveAndClose();
        });

        // # Post the image link to the channel
        cy.postMessage('Hello ![test image](https://www.mattermost.org/wp-content/uploads/2016/03/logoHorizontal.png)');

        // * Confirm the image container is visible
        cy.uiWaitUntilMessagePostedIncludes('Hello');
        cy.get('.markdown-inline-img__container').should('be.visible');

        // # Hover over image then click to open preview image
        cy.get('.file-preview__button').trigger('mouseover').click();

        // * Confirm image is visible
        cy.findByTestId('imagePreview').should('be.visible');
    });
});
