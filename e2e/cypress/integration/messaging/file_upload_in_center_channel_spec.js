// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function waitForImageUpload() {
    // * Verify that the image exists in the post message footer
    cy.get('#postCreateFooter').should('be.visible').find('div.post-image__column').
        should('exist').
        and('be.visible');
}

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Set the default image preview setting to Expanded
        cy.apiSavePreviewCollapsedPreference('false');
    });

    it('M16425 : Show single image thumbnails in standard mode', () => {
        // # Set the messages display setting to standard i.e not compact
        cy.apiSaveMessageDisplayPreference();

        // # upload an image
        const IMAGE_NAME = 'huge-image.jpg';
        cy.fileUpload('#fileUploadInput', IMAGE_NAME);
        waitForImageUpload();

        // # post it with a message
        const IMAGE_WITH_POST_TEXT = 'image in compact display setting';
        cy.postMessage(IMAGE_WITH_POST_TEXT);

        cy.getLastPostId().then((lastPostId) => {
            // # Get to last post's message
            cy.get(`#${lastPostId}_message`).should('exist').within(() => {
                // * Check if typed message appeared in the post
                cy.findByText(IMAGE_WITH_POST_TEXT).should('exist');

                // * Check if image name appeared
                cy.findByText(IMAGE_NAME).should('exist');

                // * Check if collapse/expand button appeared, since its an icon button without text,
                // finding it by Aria Label, as thats what screen readers will call out
                cy.findByLabelText('Toggle Embed Visibility').should('exist');

                // * Since last post was image upload, it should contain img with height property of 350px
                cy.get('img').should('exist').and('have.css', 'max-height', '350px');
            });
        });
    });

    it('M16425 : Show single image thumbnails in compact mode', () => {
        // # Set the messages display setting to compact
        cy.apiSaveMessageDisplayPreference('compact');

        // # upload an image
        const IMAGE_NAME = 'huge-image.jpg';
        cy.fileUpload('#fileUploadInput', IMAGE_NAME);
        waitForImageUpload();

        // # post it with a message
        const IMAGE_WITH_POST_TEXT = 'image in standard display setting';
        cy.postMessage(IMAGE_WITH_POST_TEXT);

        cy.getLastPostId().then((lastPostId) => {
            // # Get to last post's message
            cy.get(`#${lastPostId}_message`).should('exist').within(() => {
                // * Check if typed message appeared in the post
                cy.findByText(IMAGE_WITH_POST_TEXT).should('exist');

                // * Check if image name appeared
                cy.findByText(IMAGE_NAME).should('exist');

                // * Check if collapse/expand button appeared, since its an icon button without text,
                // finding it by Aria Label, as thats what screen readers will call out
                cy.findByLabelText('Toggle Embed Visibility').should('exist');

                // * Since last message was image upload, it should contain img with height property of 1750px in standard mode
                cy.get('img').should('be.visible').and('have.css', 'max-height', '175px');
            });
        });
    });
});
