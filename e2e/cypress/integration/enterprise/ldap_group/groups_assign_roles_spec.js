// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap_group

// # Function to get all the teams associated to group and unlink them
const getTeamsAssociatedToGroupAndUnlink = (groupId) => {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupId}/teams`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        response.body.forEach((element) => {
            cy.request({
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                url: `/api/v4/groups/${element.group_id}/teams/${element.team_id}/link`,
                method: 'DELETE',
            });
        });
    });
};

// # Function to get all the channels associated to group and unlink them
const getChannelsAssociatedToGroupAndUnlink = (groupId) => {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupId}/channels`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        response.body.forEach((element) => {
            cy.request({
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                url: `/api/v4/groups/${element.group_id}/channels/${element.channel_id}/link`,
                method: 'DELETE',
            });
        });
    });
};

describe('System Console', () => {
    before(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // * Check if server has license for LDAP Groups
        cy.requireLicenseForFeature('LDAPGroups');

        // Enable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: true}});

        // # Check and run LDAP Sync job
        if (Cypress.env('runLDAPSync')) {
            cy.checkRunLDAPSync();
        }
    });

    it('MM-20058 - System Admin can map roles to teams and channels via group configuration page', () => {
        // # Go to system admin page and to team configuration page of channel "eligendi"
        cy.visit('/admin_console/user_management/groups');
        cy.get('#developers_group').then((el) => {
            if (el.text().includes('Edit')) {
                cy.get('#developers_edit').then((buttonEl) => {
                    // # Get the Group ID and remove all the teams and channels currently attached to it then click the button
                    const groupId = buttonEl[0].href.match(/\/(?:.(?!\/))+$/)[0].substring(1);
                    getTeamsAssociatedToGroupAndUnlink(groupId);
                    getChannelsAssociatedToGroupAndUnlink(groupId);
                    cy.get('#developers_edit').click();
                });
            } else {
                // # Link the Group if its not linked before
                if (el.find('.icon.fa-unlink').length > 0) {
                    el.find('.icon.fa-unlink').click();
                }

                // # Get the Group ID and remove all the teams and channels currently attached to it then click the button
                cy.get('#developers_configure').then((buttonEl) => {
                    const groupId = buttonEl[0].href.match(/\/(?:.(?!\/))+$/)[0].substring(1);
                    getTeamsAssociatedToGroupAndUnlink(groupId);
                    getChannelsAssociatedToGroupAndUnlink(groupId);
                    cy.get('#developers_configure').click();
                });
            }
        });

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Add the first team in the group list then save
        cy.get('#add_team_or_channel').click();
        cy.get('#add_team').click();
        cy.get('#multiSelectList').should('be.visible').children().first().click({force: true});
        cy.get('#saveItems').should('be.visible').click();

        // # Add the first channel in the group list then save
        cy.get('#add_team_or_channel').click();
        cy.get('#add_channel').click();
        cy.get('#multiSelectList').children().first().click();
        cy.get('#saveItems').click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        cy.get('#team_and_channel_membership_table').then((el) => {
            // * Ensure that the text in the roles column is Member as default text for each row
            const name = el[0].rows[1].cells[0].innerText;
            cy.findByTestId(`${name}_current_role`).scrollIntoView().should('contain.text', 'Member');

            // # Change the option to the admin roles (Channel Admin/Team Admin) for each row
            cy.findByTestId(`${name}_current_role`).scrollIntoView().click();
            cy.findByTestId(`${name}_role_to_be`).scrollIntoView().click();

            // * Ensure that each row roles have changed successfully (by making sure that the Member text is not existent anymore)
            cy.findByTestId(`${name}_current_role`).scrollIntoView().should('not.contain.text', 'Member');
        });
    });
});
