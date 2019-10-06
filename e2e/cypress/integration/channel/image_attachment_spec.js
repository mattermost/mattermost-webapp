// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Image attachment', () => {
    before(() => {
        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                cy.visit(`/${response.body.name}`);
            });
        });
    });

    it('Image smaller than 48px in both width and height', () => {
        // # Upload a file on center view
        cy.fileUpload('#fileUploadInput', 'small-image.png');

        // # Post message
        cy.postMessage('image uploaded');

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            // * Verify that the image is inside a container div
            cy.get(`#post_${postId}`).find('div.small-image__container').as('containerDiv').
                should('have.class', 'cursor--pointer').
                and('have.class', 'a11y--active').
                and('have.class', 'small-image__container--min-width').
                and('have.css', 'height', '48px').
                and('have.css', 'width', '48px');

            cy.get('@containerDiv').children('img').
                should('have.class', 'min-preview').
                and('have.css', 'height', '24px').
                and('have.css', 'width', '24px');
        });
    });

    it('Image with height smaller than 48px', () => {
        // # Upload a file on center view
        cy.fileUpload('#fileUploadInput', 'image-small-height.png');

        // # Post message
        cy.postMessage('image uploaded');

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            // * Verify that the image is inside a container div
            cy.get(`#post_${postId}`).find('div.small-image__container').as('containerDiv').
                should('have.class', 'cursor--pointer').
                and('have.class', 'a11y--active').
                and('have.css', 'height', '48px').
                and('have.css', 'width', '342px');

            cy.get('@containerDiv').children('img').
                should('have.class', 'min-preview').
                and('have.css', 'height', '26px').
                and('have.css', 'width', '340px');
        });
    });

    it('Image with width smaller than 48px', () => {
        // # Upload a file on center view
        cy.fileUpload('#fileUploadInput', 'image-small-width.png');

        // # Post message
        cy.postMessage('image uploaded');

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            // * Verify that the image is inside a container div
            cy.get(`#post_${postId}`).find('div.small-image__container').as('containerDiv').
                should('have.class', 'cursor--pointer').
                and('have.class', 'a11y--active').
                and('have.class', 'small-image__container--min-width').
                and('have.css', 'height', '350px').
                and('have.css', 'width', '48px');

            cy.get('@containerDiv').children('img').
                should('have.class', 'min-preview').
                and('have.css', 'height', '350px').
                and('have.css', 'width', '22px');
        });
    });

    it('Image with width and height bigger than 48px', () => {
        // # Upload a file on center view
        cy.fileUpload('#fileUploadInput', 'MM-logo-horizontal.png');

        // # Post message
        cy.postMessage('image uploaded');

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('div.file-preview__button').as('div').
                should('have.class', 'style--none');

            cy.get('@div').find('img').
                and('have.css', 'height', '142px').
                and('have.css', 'width', '899px');
        });
    });

    it('opens image preview window when image is clicked', () => {
        // # Upload a file on center view
        cy.fileUpload('#fileUploadInput', 'MM-logo-horizontal.png');

        // # Post message
        cy.postMessage('image uploaded');

        cy.getLastPostId().then((postId) => {
            // # Get the image and simulate a click.
            cy.get(`#post_${postId}`).find('div.file-preview__button').as('div').
                should('have.class', 'style--none');

            cy.get('@div').find('img').
                and('have.css', 'height', '142px').
                and('have.css', 'width', '899px').
                click();

            // * Verify that the preview modal opens
            cy.get('div.modal-image__content').should('be.visible');

            // # Close the modal
            cy.get('div.modal-close').should('exist').click({force: true});
        });
    });

    it('opens image preview window when small image is clicked', () => {
        // # Upload a file on center view
        cy.fileUpload('#fileUploadInput', 'small-image.png');

        // # Post message
        cy.postMessage('image uploaded');

        cy.getLastPostId().then((postId) => {
            // # Get the container div and simulate a click.
            cy.get(`#post_${postId}`).find('div.small-image__container').as('containerDiv').
                and('have.css', 'height', '48px').
                and('have.css', 'width', '48px').
                click();

            // * Verify that the preview modal opens
            cy.get('div.modal-image__content').should('be.visible');
        });
    });
});
