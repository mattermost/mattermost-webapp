// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Header', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');

        // # Create new test team
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            cy.visit(`/${response.body.name}`);
        });
    });

    it('M13564 Ellipsis indicates the channel header is too long', () => {
        // * Verify with short channel header
        updateAndVerifyChannelHeader('>', 'newheader');

        // * Verify with long channel header
        updateAndVerifyChannelHeader('>', 'newheader'.repeat(20));
    });

    it('CS14730 - Channel Header: Markdown quote', () => {
        // # Update channel header text
        const header = 'This is a quote in the header';
        updateAndVerifyChannelHeader('>', header);
    });

    it('M14784 - An ellipsis indicates the channel header is too long - DM', () => {
        // # Open Account Setting and enable Compact View on the Display tab
        cy.changeMessageDisplaySetting('COMPACT');

        // # Open a DM with user named 'user-2'
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.TINY);
        cy.focused().type('user-2', {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.TINY);
        cy.get('#saveItems').click().wait(TIMEOUTS.TINY);

        // # Update DM channel header
        const header = 'quote newheader newheader newheader newheader newheader newheader newheader newheader newheader newheader';

        updateAndVerifyChannelHeader('>', header);

        // # Click the header to see the whole text
        cy.get('#channelHeaderDescription').click();

        // * Check that no elippsis is present
        cy.get('#header-popover > div.popover-content').should('have.html', `<blockquote>\n<p>${header}</p>\n</blockquote>`);

        cy.apiSaveMessageDisplayPreference();
    });

    it('S13483 - Cleared search term should not reappear as RHS is opened and closed', () => {
        // # Place the focus on the search box and search for something
        cy.get('#searchFormContainer').click();
        cy.get('#searchBox').should('be.visible').
            type('London{enter}').
            wait(1000).
            clear();

        // # Verify the Search side bar opens up
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Search Results');

        // # Close the search side bar
        // * Verify the Search side bar is closed
        cy.get('#searchResultsCloseButton').should('be.visible').click();
        cy.get('#sidebar-right').should('not.be.visible');

        // # Verify that the cleared search text does not appear on the search box
        cy.get('#searchBox').should('be.visible').and('be.empty');

        // # Click the pin icon to open the pinned posts RHS
        cy.get('#channelHeaderPinButton').should('be.visible').click();
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned Posts in');

        // # Verify that the Search term input box is still cleared and search term does not reappear when RHS opens
        cy.get('#searchBox').should('have.attr', 'value', '').and('be.empty');
    });
});

function updateAndVerifyChannelHeader(prefix, header) {
    // # Update channel header
    cy.updateChannelHeader(prefix + header);

    // * Should render blockquote if it starts with ">"
    if (prefix === '>') {
        cy.get('#channelHeaderDescription > span > blockquote').should('be.visible');
    }

    // * Check if channel header description has ellipsis
    cy.get('#channelHeaderDescription > .header-description__text').find('p').
        should('have.text', header).
        and('have.css', 'overflow', 'hidden').
        and('have.css', 'text-overflow', 'ellipsis');
}
