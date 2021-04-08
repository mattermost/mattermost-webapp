// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @filesearch

describe('Channel files', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('Click channel file should show the list of files in the channel', () => {
        // # Ensure Direct Message is visible in LHS sidebar
        cy.uiGetLhsSection('DIRECT MESSAGES').should('be.visible');

        // # Post file to user
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile('word-file.doc');
        cy.get('.post-image__thumbnail').should('be.visible');
        cy.postMessage('{enter}');

        // # Post file to user
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile('wordx-file.docx');
        cy.get('.post-image__thumbnail').should('be.visible');
        cy.postMessage('{enter}');

        // # Post file to user
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile('jpg-image-file.jpg');
        cy.get('.post-image__thumbnail').should('be.visible');
        cy.postMessage('{enter}');

        // # Click the channel files icon
        cy.get('#channelHeaderFilesButton').should('be.visible').click();

        // # Search message in each filtered result
        cy.get('#search-items-container').find('.fileDataName').each(($el) => {
            cy.wrap($el).should('contain.text', '-file');
        });

        // # Filter by Images
        cy.get('.FilesFilterMenu .icon').should('be.visible').click();
        cy.get('.FilesFilterMenu .MenuItem').contains('Images').should('be.visible').click();

        // # Search message in each filtered result
        cy.get('#search-items-container').find('.fileDataName').each(($el) => {
            cy.wrap($el).should('have.text', 'jpg-image-file.jpg');
        });
    });
});
