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
    let testUser;
    let townSquareLink;

    before(() => {
        // # Enable Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            townSquareLink = `/${team.name}/channels/town-square`;

            // # Save Show Preview Preference to true
            // # Save Preview Collapsed Preference to false
            cy.apiSaveLinkPreviewsPreference('true');
            cy.apiSaveCollapsePreviewsPreference('false');

            cy.visit(townSquareLink);
        });
    });

    it('MM-T199 Link preview - Removing it from my view removes it from other user\'s view', () => {
        const message = 'https://www.bbc.com/news/uk-wales-45142614';

        // # Post message to use
        cy.postMessage(message);

        cy.getLastPostId().then((postId) => {
            // * Check the preview is shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('exist');

            // # Log-in to the other user
            cy.apiAdminLogin();
            cy.visit(townSquareLink);

            // * Check the preview is shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('exist');

            // # Log-in back to the first user
            cy.apiLogin(testUser);
            cy.visit(townSquareLink);

            // # Collapse the preview
            cy.get(`#${postId}_message`).find('.post__embed-visibility').click({force: true});

            // * Check the preview is not shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('not.exist');

            // # Log-in to the other user
            cy.apiAdminLogin();
            cy.visit(townSquareLink);

            // * Check the preview is shown
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('exist');

            // # Log-in back to the first user
            cy.apiLogin(testUser);
            cy.visit(townSquareLink);

            // # Remove the preview
            cy.get(`#${postId}_message`).within(() => {
                cy.findByTestId('removeLinkPreviewButton').click({force: true});
            });

            // * Preview should not exist
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('not.exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('not.exist');

            // # Log-in to the other user
            cy.apiAdminLogin();
            cy.visit(townSquareLink);

            // * Preview should not exist
            cy.get(`#${postId}_message`).find('.attachment--opengraph').should('not.exist');
            cy.get(`#${postId}_message`).find('.attachment__image').should('not.exist');
        });
    });
});
