// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import uuid from 'uuid/v4';
const PAGE_SIZE = 10;

describe('Search channels', () => {
    before(() => {
        // * Check if server has license for LDAP Groups
        cy.requireLicenseForFeature('LDAPGroups');
    });

    beforeEach(() => {
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/channels');
        cy.wrap([]).as('createdChannelIDs');
    });

    afterEach(function() {
        this.createdChannelIDs.forEach((channelID) => {
            cy.apiDeleteChannel(channelID);
        });
    });

    it('loads with no search text', () => {
        // * Check that text input loads empty.
        cy.findByTestId('search-input').should('be.visible').and('have.text', '');
    });

    it('returns results', function() {
        const displayName = uuid();
        cy.apiGetTeams().then((response) => {
            const teamID = response.body[0].id;

            // # Create a channel.
            cy.apiCreateChannel(teamID, 'channel-search', displayName).then((cResponse) => {
                this.createdChannelIDs.push(cResponse.body.id);
            });

            // # Search for the channel.
            cy.findByTestId('search-input').type(displayName + '{enter}');

            // * Check that channel is in search results.
            cy.findAllByTestId('channel-display-name').contains(displayName);
        });
    });

    it('results are paginated', function() {
        const displayName = uuid();
        cy.apiGetTeams().then((response) => {
            const teamID = response.body[0].id;

            // # Create enough new channels with common name prefixes to get multiple pages of search results.
            for (let i = 0; i < PAGE_SIZE + 2; i++) {
                cy.apiCreateChannel(teamID, 'channel-search-paged-' + i, displayName + ' ' + i).then((cResponse) => {
                    this.createdChannelIDs.push(cResponse.body.id);
                });
            }

            // # Search using the common channel name prefix.
            cy.findByTestId('search-input').type(displayName + '{enter}');

            // * Check that the first page of results is full.
            cy.findAllByTestId('channel-display-name').should('have.length', PAGE_SIZE);

            // # Click the next pagination arrow.
            cy.findByTestId('page-link-next').should('be.enabled').click();

            // * Check that the 2nd page of results has the expected amount.
            cy.findAllByTestId('channel-display-name').should('have.length', 2);
        });
    });

    it('clears the results when "x" is clicked', function() {
        const displayName = uuid();
        cy.apiGetTeams().then((response) => {
            const teamID = response.body[0].id;

            // # Create a new channel.
            cy.apiCreateChannel(teamID, 'channel-search', displayName).then((cResponse) => {
                this.createdChannelIDs.push(cResponse.body.id);
            });

            // # Search for the channel.
            cy.get('[data-testid=search-input]').as('searchInput').type(displayName + '{enter}');

            // * Check that the list of channels is in search results mode.
            cy.findAllByTestId('channel-display-name').should('have.length', 1);

            // # Click the x in the search input.
            cy.findByTestId('clear-search').click();

            // * Check that the search input text is cleared.
            cy.get('@searchInput').should('be.visible').and('have.text', '');

            // * Check that the search results are reset to the default page-load list.
            cy.findAllByTestId('channel-display-name').should('have.length', PAGE_SIZE);
        });
    });

    it('clears the results when the search term is deleted with backspace', function() {
        const displayName = uuid();
        cy.apiGetTeams().then((response) => {
            const teamID = response.body[0].id;

            // # Create a channel.
            cy.apiCreateChannel(teamID, 'channel-search', displayName).then((cResponse) => {
                this.createdChannelIDs.push(cResponse.body.id);
            });

            // # Search for the channel.
            cy.get('[data-testid=search-input]').as('searchInput').type(displayName + '{enter}');

            // * Check that the list of teams is in search results mode.
            cy.findAllByTestId('channel-display-name').should('have.length', 1);

            // # Clear the search input by deleting the search text.
            cy.get('@searchInput').type('{selectall}{del}');

            // * Check that the search results are reset to the default page-load list.
            cy.findAllByTestId('channel-display-name').should('have.length', PAGE_SIZE);
        });
    });
});
