// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

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

    it('MM-T331 Image link preview - Collapse and expand', () => {
        const link = 'http://www.traveller.com.au/content/dam/images/g/u/n/q/h/0/image.related.articleLeadwide.620x349.gunpvd.png/1488330286332.png';

        // # Post a link to an externally hosted image
        cy.postMessage(link);
        cy.findByLabelText('file thumbnail').click().then(() => {
            cy.findByTestId('imagePreview').should('be.visible').and('have.attr', 'src','http://localhost:8065/api/v4/image?url=http%3A%2F%2Fwww.traveller.com.au%2Fcontent%2Fdam%2Fimages%2Fg%2Fu%2Fn%2Fq%2Fh%2F0%2Fimage.related.articleLeadwide.620x349.gunpvd.png%2F1488330286332.png');
            //cy.findByTestId('imagePreview').should('have.attr', 'style').and('include', 'width: 649px').and('include', 'height: 349px');
            cy.findByText('File 1 of 1').should('be.visible');
            cy.findByText('Open').should('be.visible');
            cy.findByTestId('imagePreview').then(function(el) {
                const imageUrl = el.prop('src');
                console.log(imageUrl)
                cy.log(imageUrl);
                cy.request(imageUrl).then((res) => {
                    expect(res.status).equal(200);
                })
            })
        });
        //cy.findByTestId('imagePreview').click()
    });
});
