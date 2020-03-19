// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// * Verify the accessibility support in the menu items
function verifyMenuItems(menuEl, labels) {
    cy.get(`${menuEl} .MenuItem`).each((child, index) => {
        cy.wrap(child).then((el) => {
            cy.wrap(el).should('have.attr', 'role', 'menuitem');
            const label = labels[index];
            if (el.find('button').length) {
                if (label) {
                    cy.wrap(el).children('button').should('have.attr', 'aria-label', label).and('have.class', 'a11y--active a11y--focused').tab();
                } else {
                    cy.wrap(el).children('button').should('have.class', 'a11y--active a11y--focused').tab();
                }
            } else {
                cy.wrap(el).children('a').should('have.class', 'a11y--active a11y--focused').tab();
            }
        });
    });
}

describe('Verify Accessibility Support in Dropdown Menus', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // # Ensure an open team is available to join
        cy.getCurrentUserId().then((userId) => {
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                const teamId = response.body.id;
                cy.removeUserFromTeam(teamId, userId);
            });
        });
    });

    beforeEach(() => {
        // Visit the Off Topic channel
        cy.visit('/ad-1/channels/off-topic');
    });

    it('MM-22627 Accessibility Support in Channel Menu Dropdown', () => {
        // # Press tab from the Channel Favorite button
        cy.get('#toggleFavorite').focus().tab({shift: true}).tab().tab();

        // * Verify the aria-label in channel menu button
        cy.get('#channelHeaderDropdownButton button').should('have.attr', 'aria-label', 'channel menu').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify the accessibility support in the Channel Dropdown menu
        cy.get('#channelHeaderDropdownMenu').should('have.attr', 'aria-label', 'channel menu').and('have.class', 'a11y__popup').and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.get('#channelHeaderDropdownMenu .MenuItem').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

        // # Press tab
        cy.focused().tab();

        // * Verify the accessibility support in the Channel Dropdown menu items
        const labels = ['View Info dialog', 'Notification Preferences dialog', '', 'Add Members dialog', 'Manage Members dialog', 'Edit Channel Header dialog', 'Edit Channel Purpose dialog', 'Rename Channel dialog', 'Convert to Private Channel dialog', 'Archive Channel dialog', ''];
        verifyMenuItems('#channelHeaderDropdownMenu', labels);

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.get('#channelHeaderDropdownMenu').should('not.exist');
    });

    it('MM-22627 Accessibility Support in Main Menu Dropdown', () => {
        // # Press tab from the Set Status button
        cy.get('.status-wrapper button.status').focus().tab({shift: true}).tab().tab();

        // * Verify the aria-label in main menu button
        cy.get('#headerInfo button').should('have.attr', 'aria-label', 'main menu').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify the accessibility support in the Main Menu Dropdown
        cy.get('#sidebarDropdownMenu').should('have.attr', 'aria-label', 'main menu').and('have.class', 'a11y__popup').and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.get('#sidebarDropdownMenu .MenuItem').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

        // # Press tab
        cy.focused().tab();

        // * Verify the accessibility support in the Main Menu Dropdown items
        cy.apiGetConfig().then((response) => {
            const siteName = response.body.TeamSettings.SiteName;
            const labels = ['Account Settings dialog', 'Invite People dialog', 'Team Settings dialog', 'Manage Members dialog', '', '', 'Leave Team dialog', '', 'Plugin Marketplace dialog', '', '', '', '', '', `About ${siteName} dialog`, ''];
            verifyMenuItems('#sidebarDropdownMenu', labels);
        });

        cy.get('#sidebarDropdownMenu .MenuItem').each((el) => {
            cy.wrap(el).should('have.attr', 'role', 'menuitem');
        });

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.get('#sidebarDropdownMenu').should('not.exist');
    });

    it('MM-22627 Accessibility Support in Status Dropdown', () => {
        // # Press tab from Add Team button
        cy.get('#select_teamTeamButton').focus().tab({shift: true}).tab().tab();

        // * Verify the aria-label in status menu button
        cy.get('.status-wrapper button.status').should('have.attr', 'aria-label', 'set status').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify the accessibility support in the Status Dropdown
        cy.get('#statusDropdownMenu').should('have.attr', 'aria-label', 'set status').and('have.class', 'a11y__popup').and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.get('#statusDropdownMenu .MenuItem').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

        // # Press tab
        cy.focused().tab();

        // * Verify the accessibility support in the Status Dropdown menu items
        const labels = ['online', 'away', 'do not disturb. disables desktop, email and push notifications', 'offline'];
        verifyMenuItems('#statusDropdownMenu', labels);

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.get('#statusDropdownMenu').should('not.exist');
    });
});