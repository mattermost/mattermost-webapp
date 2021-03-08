// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod

describe('Upload Files', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T307 Cancel a file upload', () => {
        const hugeImage = 'huge-image.jpg';

        const options = {method: 'POST', url: '/api/v4/files'};
        cy.server();

        // # Stub response of /files endpoint
        cy.route({...options, response: {client_ids: [], file_infos: []}});

        // # Post an image in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(hugeImage);

        // * Verify thumbnail of ongoing file upload
        cy.get('.file-preview__container').should('be.visible').within(() => {
            cy.get('.post-image__thumbnail').should('be.visible');
            cy.findByText(hugeImage).should('be.visible');
            cy.findByText('Processing...').should('be.visible');
        });

        // # Click the `X` on the file attachment thumbnail
        cy.get('.file-preview__remove > .icon').click();

        // * Check if thumbnail disappears
        cy.get('.post-image').should('not.exist');
        cy.findByLabelText('file thumbnail').should('not.exist');

        // # Release response of /files endpoint
        cy.route({...options});

        // # Post a different file in center channel
        const filename = 'long_text_post.txt';
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        cy.postMessage('{enter}');

        // * Verify the file is successfully posted as last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#${postId}_message`).should('exist').within(() => {
                // * Check if file name appeared
                cy.findByText(filename).should('exist');
            });
        });
    });
});
