// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

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
        let filename = 'huge-image.jpg';

        // # Post an image in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        cy.get('.post-image').should('be.visible');

        // # Click the `X` on the file attachment thumbnail
        cy.get('.file-preview__remove > .icon').click();

        // * Check if thumbnail disappears
        cy.get('.post-image').should('not.exist');
        cy.findByLabelText('file thumbnail').should('not.exist');

        filename = 'long_text_post.txt';

        // # Post a different file in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        cy.postMessage('{enter}');
    });
});
