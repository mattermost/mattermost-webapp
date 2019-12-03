// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    const IMAGE_NAME = 'huge-image.jpg';
    const IMAGE_WITH_POST_TEXT = 'image upload with message';

    before(() => {
        // # Login and navigate to town-square
        cy.toMainChannelView('user-1');

        // # Set the default image preview setting to Expanded
        cy.apiSavePreviewCollapsedPreference('false');

        // # upload an image
        cy.fileUpload('#fileUploadInput', IMAGE_NAME);

        // # post it with a message
        cy.postMessage(IMAGE_WITH_POST_TEXT);
    });

    it('M16425 : Show single image thumbnails in standard mode', () => {
        // # Set the messages display setting to standard i.e not compact
        cy.apiSaveMessageDisplayPreference();

        cy.getLastPostId().then((lastPostId) => {
            const POST_MESSAGE_CONTAINER = `#${lastPostId}_message`;

            // # Get to last post's message
            cy.get(POST_MESSAGE_CONTAINER).should('be.visible').within(() => {
                // * Check if image has max height property of 350px and is visible
                cy.get('img').should('be.visible').and('have.css', 'max-height', '350px');

                const POST_MESSAGE_TEXT_CONTAINER = `#postMessageText_${lastPostId}`;

                // * Check if typed message appeared
                cy.get(POST_MESSAGE_TEXT_CONTAINER).contains(IMAGE_WITH_POST_TEXT).should('be.visible');

                const COLLAPSE_EXPAND_TOGGLE = `#single_file_upload__toggle_${lastPostId}`;

                // * Check if collapse/expand button appeared
                cy.get(COLLAPSE_EXPAND_TOGGLE).should('be.visible');

                const IMAGE_FILE_NAME_CONTAINER = `#single_file_upload__name_${lastPostId}`;

                // * Check if image name appeared
                cy.get(IMAGE_FILE_NAME_CONTAINER).contains(IMAGE_NAME).should('be.visible');
            });
        });
    });

    it('M16425 : Show single image thumbnails in compact mode', () => {
        // # Set the messages display setting to compact
        cy.apiSaveMessageDisplayPreference('compact');

        cy.getLastPostId().then((lastPostId) => {
            const POST_MESSAGE_CONTAINER = `#${lastPostId}_message`;

            // # Get to last post's message
            cy.get(POST_MESSAGE_CONTAINER).should('be.visible').within(() => {
                // * Check if image has max height property of 350px and is visible
                cy.get('img').should('be.visible').and('have.css', 'max-height', '175px');

                const POST_MESSAGE_TEXT_CONTAINER = `#postMessageText_${lastPostId}`;

                // * Check if typed message appeared
                cy.get(POST_MESSAGE_TEXT_CONTAINER).contains(IMAGE_WITH_POST_TEXT).should('be.visible');

                const COLLAPSE_EXPAND_TOGGLE = `#single_file_upload__toggle_${lastPostId}`;

                // * Check if collapse/expand button appeared
                cy.get(COLLAPSE_EXPAND_TOGGLE).should('be.visible');

                const IMAGE_FILE_NAME_CONTAINER = `#single_file_upload__name_${lastPostId}`;

                // * Check if image name appeared
                cy.get(IMAGE_FILE_NAME_CONTAINER).contains(IMAGE_NAME).should('be.visible');
            });
        });
    });
});
