// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Header', () => {
    let otherUser;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;
                cy.apiAddUserToTeam(team.id, otherUser.id);
            });

            cy.apiLogin(user);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T88 An ellipsis indicates the channel header is too long - public or private channel Quote icon displays at beginning of channel header', () => {
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

    it('MM-T89 An ellipsis indicates the channel header is too long - DM', () => {
        // # Open Account Setting and enable Compact View on the Display tab
        cy.uiChangeMessageDisplaySetting('COMPACT');

        // # Open a DM with other user
        cy.uiAddDirectMessage().click().wait(TIMEOUTS.HALF_SEC);
        cy.focused().type(otherUser.username, {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.HALF_SEC);
        cy.get('#saveItems').click().wait(TIMEOUTS.HALF_SEC);

        // # Update DM channel header
        const header = 'quote newheader newheader newheader newheader newheader newheader newheader newheader newheader newheader';

        updateAndVerifyChannelHeader('>', header);

        // # Click the header to see the whole text
        cy.get('#channelHeaderDescription').click();

        // * Check that no elippsis is present
        cy.get('#header-popover > div.popover-content').
            should('have.html', `<span><blockquote>\n<p>${header}</p>\n</blockquote></span>`);

        cy.apiSaveMessageDisplayPreference('clean');
    });

    it('S13483 - Cleared search term should not reappear as RHS is opened and closed', () => {
        // # Place the focus on the search box and search for something
        cy.get('#searchFormContainer').click();
        cy.get('#searchBox').should('be.visible').
            type('London{enter}').
            wait(TIMEOUTS.ONE_SEC).
            clear();
        cy.get('#searchbar-help-popup').should('be.visible');
        cy.get('#searchFormContainer').type('{esc}');

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
        cy.get('#sidebar-right').should('be.visible').and('contain', 'Pinned Posts');

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
