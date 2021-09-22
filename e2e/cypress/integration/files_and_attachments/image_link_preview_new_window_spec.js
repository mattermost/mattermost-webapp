// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @files_and_attachments

describe('Image Link Preview', () => {
    before(() => {
        // # Enable Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        // # Create new team and new user and visit test channel
        cy.apiInitSetup({loginAfter: true}).then(({channelUrl}) => {
            // # For test user, enable link previews and expand image previews
            cy.apiSaveLinkPreviewsPreference('true');
            cy.apiSaveCollapsePreviewsPreference('false');

            cy.visit(channelUrl);
        });
    });

    it('MM-T329 Image link preview', () => {
        const link = 'http://www.traveller.com.au/content/dam/images/g/u/n/q/h/0/image.related.articleLeadwide.620x349.gunpvd.png/1488330286332.png';
        const baseUrl = Cypress.config('baseUrl');
        const encodedIconUrl = encodeURIComponent(link);

        // # Post a link to an externally hosted image
        cy.postMessage(link);

        const expectedSrc = `${baseUrl}/api/v4/image?url=${encodedIconUrl}`;

        // # Open file preview
        cy.uiGetPostEmbedContainer().
            find('img').
            should('have.attr', 'src', expectedSrc).
            click();

        cy.uiGetFilePreviewModal().within(() => {
            // * Assert that the image has the correct url
            cy.findByTestId('imagePreview').should('have.attr', 'src', expectedSrc);

            cy.uiGetContentFilePreviewModal().find('img').should((img) => {
                // * Verify image is rendered
                expect(img.height()).to.be.closeTo(349, 2);
                expect(img.width()).to.be.closeTo(620, 2);
            });

            // # Close modal
            cy.uiCloseFilePreviewModal();
        });

        // # Verify modal is closed
        cy.uiGetFilePreviewModal({exist: false});

        cy.uiGetPostBody().find('.markdown__link').then((el) => {
            const href = el.prop('href');
            cy.request(href).then((res) => {
                expect(res.status).equal(200);
            });

            expect(link).to.equal(href);
        });
    });
});
