// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar @not_cloud

describe('Legacy sidebar settings', () => {
    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T2002 Should toggle the legacy sidebar when Enable Legacy Sidebar setting is toggled', () => {
        // * Verify the the new sidebar is currently displayed
        cy.get('#SidebarContainer').should('be.visible');

        // # Toggle the legacy sidebar on
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLegacySidebar: true,
            },
        });

        // * Verify that the legacy sidebar now displays
        cy.get('.sidebar--left').should('be.visible');

        // # Toggle the legacy sidebar off
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLegacySidebar: false,
            },
        });

        // * Verify that the legacy sidebar is gone and the new sidebar displays
        cy.get('.sidebar--left').should('not.be.visible');
        cy.get('#SidebarContainer').should('be.visible');
    });
});
