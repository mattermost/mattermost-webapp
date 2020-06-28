// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Archived channels', () => {
    let testChannel;

    before(() => {
        cy.requireLicense();

        cy.apiInitSetup().then(({team}) => {
            cy.apiCreateChannel(team.id, `aaa-archive-${Date.now()}`, 'AAA Archive Test').then((response) => {
                testChannel = response.body;

                // # Archive the channel
                cy.apiDeleteChannel(testChannel.id);
            });
        });
    });

    it('are present in the channels list view', () => {
        // # Go to the channels list view
        cy.visit('/admin_console/user_management/channels');

        // # Find the archived channel
        // * Check that deleted channel displays the correct icon
        cy.findByText(testChannel.display_name).should('be.visible').find('.channel-icon__archive');
    });

    it('appear in the search results of the channels list view', () => {
        // # Go to the channels list view
        cy.visit('/admin_console/user_management/channels');

        // # Search for the archived channel
        cy.get('[data-testid=search-input]').type(`${testChannel.display_name}{enter}`);

        // * Confirm that the archived channel is in the results
        cy.findByText(testChannel.display_name).should('be.visible');
    });

    it('display an unarchive button and a limited set of other UI elements', () => {
        // # Go to the channel details view
        cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);

        // * Assert that the unarchive button
        cy.get('button.ArchiveButton').findByText('Unarchive Channel');

        // * Ensure that only one widget is presetn
        cy.get('div.AdminPanel').should('have.length', 1);
    });

    it('can be unarchived', () => {
        // # Go to the channel details view
        cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);

        cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting

        // # Click unarchvie
        cy.get('button.ArchiveButton').click();

        // * Check that the button text changed
        cy.get('button.ArchiveButton').findAllByText('Archive Channel');

        // * Ensure that the other widget appear
        cy.get('div.AdminPanel').should('have.length', 5);

        // # Save and wait for redirect
        cy.get('#saveSetting').click();
        cy.get('.groups-list').should('be.visible');

        // * Assert via the API that the channel is unarchived
        cy.apiGetChannel(testChannel.id).then((response) => {
            expect(response.body.delete_at).to.eq(0);
        });
    });
});