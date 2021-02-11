// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @file_and_attachments

describe('Image Link Preview', () => {
    let testTeam;

    before(() => {
        // # Enable Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;

            // # For test user, enable link previews and expand image previews
            cy.apiSaveLinkPreviewsPreference('true');
            cy.apiSaveCollapsePreviewsPreference('false');

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T329 Image link preview', () => {
        const link = 'http://www.traveller.com.au/content/dam/images/g/u/n/q/h/0/image.related.articleLeadwide.620x349.gunpvd.png/1488330286332.png';
        const baseUrl = Cypress.config('baseUrl');
        const encodedIconUrl = encodeURIComponent(link);

        // # Post a link to an externally hosted image
        cy.postMessage(link);

        cy.findByLabelText('file thumbnail').click().then(() => {
            // * Assert that the image has the correct url
            cy.findByTestId('imagePreview').should('have.attr', 'src', `${baseUrl}/api/v4/image?url=${encodedIconUrl}`);

            // * Assert container elements
            cy.findByTestId('fileCountFooter').should('be.visible');
            cy.findByText('File 1 of 1').should('be.visible');
            cy.findByText('Open').should('be.visible');

            // * Assert that clicking the image will open in a new tab
            cy.get('a[href*="image"]').should('have.attr', 'target', '_blank');

            // * Assert image is available to be clicked (cypress limitation for opening new child window)
            cy.findByTestId('imagePreview').then((el) => {
                const imageUrl = el.prop('src');
                cy.request(imageUrl).then((res) => {
                    expect(res.status).equal(200);
                });
            });

            // * Close the image then assert that it is closed
            cy.findByTestId('imagePreview').trigger('mouseover').then(() => {
                cy.get('div.modal-close').click();
                cy.findByTestId('imagePreview').should('not.exist');
            });
        });
    });
});
