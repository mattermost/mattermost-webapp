// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('System Console', () => {
    it('MM-20058 - System Admin can map roles to teams and channels via group configuration page', () => {
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to team configuration page of channel "eligendi"
        cy.visit('/admin_console/user_management/groups');
        cy.get('#developers_group').then((el) => {
            if (el.text().includes('Edit')) {
                cy.get('#developers_edit').click();
            } else {
                cy.get('#developers_configure').click();
            }
        });

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Add the first team in the group list then save
        cy.get('#add_team_or_channel').click();
        cy.get('#add_team').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();

        // # Add the first team in the group list then save
        cy.get('#add_team_or_channel').click();
        cy.get('#add_channel').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();

        cy.get('#group_teams_and_channels').then((el) => {
            let name;
            for (let i = 1; i < el[0].childNodes[1].rows.length; i++) {
                name = el[0].childNodes[1].rows[i].cells[0].innerText;
                cy.get(`#${name}_current_role`).should('contain.text', 'Member');
            }

            for (let i = 1; i < el[0].childNodes[1].rows.length; i++) {
                name = el[0].childNodes[1].rows[i].cells[0].innerText;
                cy.wrap(el[0].childNodes[1].rows[i]).get(`#${name}_current_role`).click();
                cy.wrap(el[0].childNodes[1].rows[i]).get(`#${name}_role_to_be`).click();
            }

            for (let i = 1; i < el[0].childNodes[1].rows.length; i++) {
                name = el[0].childNodes[1].rows[i].cells[0].innerText;
                cy.get(`#${name}_current_role`).should('not.contain.text', 'Member');
            }
        });
    });
});