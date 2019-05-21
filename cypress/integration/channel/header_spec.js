// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

describe('Header', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M13564 Ellipsis indicates the channel header is too long', () => {
        // # Update channel header text
        cy.updateChannelHeader('> newheader');

        // * Check if channel header description has no ellipsis
        cy.get('#channelHeaderDescription').then(($header) => {
            expect($header.outerWidth()).to.be.closeTo($header[0].scrollWidth, 0.1);
        });

        // # Update channel header text to a long string
        cy.updateChannelHeader('>' + ' newheader'.repeat(20));

        // * Check if channel header description has ellipsis
        cy.get('#channelHeaderDescription').then(($header) => {
            expect($header.outerWidth()).lt($header[0].scrollWidth);
        });
    });

    it('CS14730 - Channel Header: Markdown quote', () => {
        // # Update channel header text
        const header = 'This is a quote in the header';
        cy.updateChannelHeader('>' + header);

        // * Make sure that description contains a blockquote sign
        cy.get('#channelHeaderDescription > span > blockquote').should('be.visible');
        cy.get('#channelHeaderDescription').should('have.html', `<span><blockquote> <p class="markdown__paragraph-inline">${header}</p></blockquote></span>`);
    });

    it('M14784 - An ellipsis indicates the channel header is too long - DM', () => {
        // # Open Account Setting and enable Compact View on the Display tab
        cy.changeMessageDisplaySetting('COMPACT');

        // # Open a DM with user named 'user-2'
        cy.get('#directChannel > .add-channel-btn').click().wait(100);
        cy.focused().type('user-2', {force: true}).type('{enter}', {force: true}).wait(500);
        cy.get('#saveItems').click();

        // # Update DM channel header
        const header = 'quote newheader newheader newheader newheader newheader newheader newheader newheader newheader newheader';
        cy.updateChannelHeader('>' + header);

        // * Check if channel header description has ellipsis
        cy.get('#channelHeaderDescription').then(($header) => {
            expect($header.outerWidth()).lt($header[0].scrollWidth);
        });

        // # Click the header to see the whole text
        cy.get('#channelHeaderDescription').click();

        // * Check that no elippsis is present
        cy.get('#header-popover > div.popover-content').should('have.html', `<blockquote>\n<p>${header}</p>\n</blockquote>`);

        cy.apiSaveMessageDisplayPreference();
    });
    it('S13483 - Cleared search term should not reappear as RHS is opened and closed', () => {
        // # Place the focus on the search box and search for something
        cy.get('#searchFormContainer').click();
        cy.get('#searchBox').type('London{enter}');

        // # Clear the search text
        cy.get('#searchBox').clear();

        // # Verify the Search side bar opens up
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Search Results');

        // # Close the search side bar
        cy.get('#searchResultsCloseButton').should('be.visible').click();

        // # Verify that the cleared search text does not appear on the search box
        cy.get('#searchBox').should('be.visible').and('be.empty');

        // # Click the pin icon to open the pinned posts RHS
        cy.get('#channelHeaderPinButton').should('be.visible').click();
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned posts in');

        // # Verify that the Search term input box is still cleared and search term does not reappear when RHS opens
        cy.get('#searchBox').should('be.visible').and('be.empty');
    });
});
