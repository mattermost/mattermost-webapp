// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires hundreds of deactivated users
 * May generate by modifying `make test-data` command at `./mattermost-server/Makefile`
 * Should change to `sampledata -w 4 -u 60 --deactivated-users 200`
 */

const perPage = 50;

describe('System Console', () => {
    it('SC18512 List pages of inactive users', () => {
        // # Login as sysadmin and go to users management page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/users');

        // # Select inactive users
        cy.get('#selectUserStatus').select('Inactive');

        cy.apiGetAnalytics().then((res) => {
            const inactiveUsers = res.body.filter((d) => {
                return d.name === 'inactive_user_count';
            }).reduce((_, item) => {
                return item.value;
            }, 0);

            const pages = Math.floor(inactiveUsers / perPage);
            const remainder = inactiveUsers % perPage;
            Cypress._.forEach(Array(pages), (_, index) => {
                if (pages === index) {
                    // * This is the last page, so:
                    // * - number of users should match the remainder
                    // * - no next button since no more inactive users to load
                    cy.getAllByTestId('userListRow').should('have.length', remainder);
                    cy.get('#searchableUserListNextBtn').should('not.be.visible');
                } else {
                    // * There are still next page to load, so:
                    // * - number of users should match per page
                    // * - next button is visible
                    // # Click "Next" to load more.
                    cy.getAllByTestId('userListRow').should('have.length', perPage);
                    cy.get('#searchableUserListNextBtn').should('be.visible').click();
                }
            });
        });
    });
});
