// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Scroll', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            // # Switch the account settings for the test user to have images collapsed by default
            cy.apiSaveCollapsePreviewsPreference('true');

            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T2370 Default images to collapsed', () => {
        const filename = 'huge-image.jpg';

        // # Post an image in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);

        cy.get('.post-image').should('be.visible');

        cy.postMessage('{enter}');

        // * Observe image preview is collapsed
        cy.findByLabelText('file thumbnail').should('not.exist');

        // # Refresh the browser
        cy.reload();

        // * Observe image preview is collapsed after reloading the page
        cy.findByLabelText('file thumbnail').should('not.exist');
    });
});
