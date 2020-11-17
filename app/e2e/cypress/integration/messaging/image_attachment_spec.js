// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

function verifyImageInPostFooter(verifyExistence = true) {
    if (verifyExistence) {
        // * Verify that the image exists in the post message footer
        cy.get('#postCreateFooter').should('be.visible').find('div.post-image__column').
            should('exist').
            and('be.visible');
    } else {
        // * Verify that the image no longer exists in the post message footer
        cy.get('#postCreateFooter').find('div.post-image__column').should('not.exist');
    }
}

describe('Image attachment', () => {
    before(() => {
        // # Login as new user
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('Image smaller than 48px in both width and height', () => {
        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('small-image.png');

        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        verifyImageInPostFooter(false);

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            // * Verify that the image is inside a container div
            cy.get(`#${postId}_message`).should('be.visible').within(() => {
                cy.get('div.small-image__container').as('containerDiv').
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
    });

    it('Image with height smaller than 48px', () => {
        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('image-small-height.png');

        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        verifyImageInPostFooter(false);

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            // * Verify that the image is inside a container div
            cy.get(`#${postId}_message`).should('be.visible').within(() => {
                cy.get('div.small-image__container').as('containerDiv').
                    should('have.class', 'cursor--pointer').
                    and('have.class', 'a11y--active').
                    and('have.css', 'height', '48px').
                    and('have.css', 'width', '342px');

                cy.get('@containerDiv').children('img').
                    should('have.class', 'min-preview').
                    and('have.css', 'height', '25px').
                    and('have.css', 'width', '340px');
            });
        });
    });

    it('Image with width smaller than 48px', () => {
        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('image-small-width.png');

        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        verifyImageInPostFooter(false);

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            // * Verify that the image is inside a container div
            cy.get(`#${postId}_message`).should('be.visible').within(() => {
                cy.get('div.small-image__container').as('containerDiv').
                    should('have.class', 'cursor--pointer').
                    and('have.class', 'a11y--active').
                    and('have.class', 'small-image__container--min-width').
                    and('have.css', 'height', '350px').
                    and('have.css', 'width', '48px');

                cy.get('@containerDiv').children('img').
                    should('have.class', 'min-preview').
                    and('have.css', 'height', '350px').
                    and((img) => {
                        expect(img.width()).to.be.closeTo(21, 0.9);
                    });
            });
        });
    });

    it('Image with width and height bigger than 48px', () => {
        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('MM-logo-horizontal.png');

        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        verifyImageInPostFooter(false);

        // * Verify that HTML Content is correct.
        // Note we check width and height to verify that img element is actually loaded
        cy.getLastPostId().then((postId) => {
            cy.get(`#${postId}_message`).should('be.visible').within(() => {
                cy.get('div.file-preview__button').as('div');

                cy.get('@div').find('img').
                    and((img) => {
                        expect(img.height()).to.be.closeTo(155, 2.0);
                        expect(img.width()).to.be.closeTo(978, 2.0);
                    });
            });
        });
    });

    it('opens image preview window when image is clicked', () => {
        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('MM-logo-horizontal.png');

        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        verifyImageInPostFooter(false);

        cy.getLastPostId().then((postId) => {
            // # Get the image and simulate a click.
            cy.get(`#${postId}_message`).should('be.visible').within(() => {
                cy.get('div.file-preview__button').as('div');

                cy.get('@div').find('img').
                    and((img) => {
                        expect(img.height()).to.be.closeTo(155, 2.0);
                        expect(img.width()).to.be.closeTo(978, 2.0);
                    }).
                    click();
            });

            // * Verify that the preview modal opens
            cy.get('div.modal-image__content').should('be.visible').trigger('mouseover');

            // # Close the modal
            cy.get('div.modal-close').should('exist').click({force: true});
        });
    });

    it('opens image preview window when small image is clicked', () => {
        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('small-image.png');

        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        verifyImageInPostFooter(false);

        cy.getLastPostId().then((postId) => {
            // # Get the container div and simulate a click.
            cy.get(`#${postId}_message`).should('be.visible').within(() => {
                cy.get('div.small-image__container').
                    should('be.visible').
                    and('have.css', 'height', '48px').
                    and('have.css', 'width', '48px').
                    click();
            });

            // * Verify that the preview modal opens
            cy.get('div.modal-image__content').should('be.visible');
        });
    });
});
