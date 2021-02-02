// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @files_and_attachments

describe('Paste Image', () => {
    let testTeam;
    const aspectRatio = 1;

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
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T2263 - Paste image in message box and post', () => {
        // # Paste image
        cy.fixture('mattermost-icon.png').then((img) => {
            const blob = Cypress.Blob.base64StringToBlob(img, 'image/png');
            cy.get('#create_post').trigger('paste', {clipboardData: {
                items: [{
                    name: 'mattermost-icon.png',
                    kind: 'file',
                    type: 'image/png',
                    getAsFile: () => {
                        return blob;
                    },
                }],
                types: [],
            }});

            cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
                return el.find('.post-image.normal').length > 0;
            }));
        });

        cy.get('#create_post').find('.file-preview').within(() => {
            // * Type is correct
            cy.get('.post-image__type').should('contain.text', 'PNG');

            // * Size is correct
            cy.get('.post-image__size').should('contain.text', '13KB');

            // * Img thumbnail exist
            cy.get('.post-image__thumbnail > .post-image').should('exist');
        });

        // # Post message
        cy.postMessage('');

        cy.getLastPost().within(() => {
            cy.get('.file-view--single').within(() => {
                // * Image is posted
                cy.get('img').should('exist').and((img) => {
                // * Image aspect ratio is maintained
                    expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
                });
            });
        });

        // # Open RHS
        cy.clickPostCommentIcon();

        cy.getLastPostId().then((id) => {
            cy.get(`#rhsPost_${id}`).within(() => {
                cy.get('.file-view--single').within(() => {
                    // * Image is posted
                    cy.get('img').should('exist').and((img) => {
                        // * Image aspect ratio is maintained
                        expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
                    });
                });
            });
        });
    });
});
