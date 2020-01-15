// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Set the configuration on Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        cy.apiLogin('user-1');
        cy.apiSaveShowPreviewPreference();
        cy.apiSavePreviewCollapsedPreference('false');

        cy.apiLogin('sysadmin');
        cy.apiSaveShowPreviewPreference();
        cy.apiSavePreviewCollapsedPreference('false');

        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18708-Link preview - Removing it from my view removes it from other user\'s view', () => {
        const message = 'https://www.bbc.com/news/uk-wales-45142614';

        // # Create new DM channel with user's email
        cy.visit('/ad-1/channels/town-square');

        // # Post message to use
        cy.postMessage(message);

        cy.getLastPostId().then((postId) => {
            // * Check the preview is shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('exist');

            // # Log-in to the other user
            cy.apiLogin('sysadmin');
            cy.visit('/ad-1/channels/town-square');

            // * Check the preview is shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('exist');

            // # Log-in back to the first user
            cy.apiLogin('user-1');
            cy.visit('/ad-1/channels/town-square');

            // # Collapse the preview
            cy.get(`#${postId}_message`).find('.post__embed-visibility').click({force: true});

            // * Check the preview is not shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('not.exist');

            // # Log-in to the other user
            cy.apiLogin('sysadmin');
            cy.visit('/ad-1/channels/town-square');

            // * Check the preview is shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('exist');

            // # Log-in back to the first user
            cy.apiLogin('user-1');
            cy.visit('/ad-1/channels/town-square');

            // # Remove the preview
            cy.get(`#${postId}_message`).within(() => {
                cy.findByTestId('removeLinkPreviewButton').click({force: true});
            });

            // * Preview should not exist
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('not.exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('not.exist');

            // # Log-in to the other user
            cy.apiLogin('sysadmin');
            cy.visit('/ad-1/channels/town-square');

            // * Preview should not exist
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('not.exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('not.exist');
        });
    });
});