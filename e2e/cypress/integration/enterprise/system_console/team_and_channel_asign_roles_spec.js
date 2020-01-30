// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

describe('System Console', () => {
    it('MM-20059 - System Admin can map roles to groups from Team Configuration screen', () => {
        const teamName = 'eligendi';
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to team configuration page of channel "eligendi"
        cy.visit('/admin_console/user_management/teams');

        // # Search for the team.
        cy.findByTestId('search-input').type(`${teamName}{enter}`);
        cy.findByTestId(`${teamName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
                waitUntilConfigSave();
            }
        });

        // # Add the first group in the group list then save
        cy.findByTestId('add-group').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // * Ensure default role is Member
        cy.findByTestId('current-role').should('have.text', 'Member').click();

        // * Assert that only one option exists in the dropdown for changing roles
        cy.get('#role-to-be-menu').then((el) => {
            expect(el[0].firstElementChild.children.length).equal(1);
        });

        // # Continue changing the role to Team Admin
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Team Admin
        cy.findByTestId('current-role').should('have.text', 'Team Admin');

        // # Change the role from Team Admin to Member
        cy.findByTestId('current-role').click();

        // * Assert that only one option exists in the dropdown for changing roles
        cy.get('#role-to-be-menu').then((el) => {
            expect(el[0].firstElementChild.children.length).equal(1);
        });

        // # Change role to memeber
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Member
        cy.findByTestId('current-role').should('have.text', 'Member');

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
                waitUntilConfigSave();
            }
        });

        // # Wait to ensure it has saved before reloading
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Reload to ensure it's been saved
        cy.reload();

        // * Assert that the group was removed successfully
        cy.get('#groups-list--body').then((el) => {
            expect(el[0].childNodes[0].innerText).equal('No groups specified yet');
        });
    });

    it('MM-21789 - Add a group and change the role and then save and ensure the role was updated on team configuration page', () => {
        const teamName = 'eligendi';
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to team configuration page of channel "eligendi"
        cy.visit('/admin_console/user_management/teams');

        // # Search for the team.
        cy.findByTestId('search-input').type(`${teamName}{enter}`);
        cy.findByTestId(`${teamName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
                waitUntilConfigSave();
            }
        });

        // # Add the first group in the group list then save
        cy.findByTestId('add-group').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();

        // * Ensure default role is Member
        cy.findByTestId('current-role').should('have.text', 'Member').click();

        // * Assert that only one option exists in the dropdown for changing roles
        cy.get('#role-to-be-menu').then((el) => {
            expect(el[0].firstElementChild.children.length).equal(1);
        });

        // # Continue changing the role to Team Admin
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Team Admin
        cy.findByTestId('current-role').should('have.text', 'Team Admin');
    });

    it('MM-20646 - System Admin can map roles to groups from Channel Configuration screen', () => {
        const channelName = 'autem';
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to channel configuration page of channel "autem"
        cy.visit('/admin_console/user_management/channels');

        // # Search for the channel.
        cy.findByTestId('search-input').type(`${channelName}{enter}`);
        cy.findByTestId(`${channelName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
                waitUntilConfigSave();
            }
        });

        // # Add the first group in the group list then save
        cy.findByTestId('add-group').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // * Ensure default role is Member
        cy.findByTestId('current-role').should('have.text', 'Member').click();

        // * Assert that only one option exists in the dropdown for changing roles
        cy.get('#role-to-be-menu').then((el) => {
            expect(el[0].firstElementChild.children.length).equal(1);
        });

        // # Continue changing the role to Channel Admin
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Wait to ensure it has saved before reloading
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Channel Admin
        cy.findByTestId('current-role').should('have.text', 'Channel Admin');

        // # Change the role from Channel Admin to member
        cy.findByTestId('current-role').click();

        // * Assert that only one option exists in the dropdown for changing roles
        cy.get('#role-to-be-menu').then((el) => {
            expect(el[0].firstElementChild.children.length).equal(1);
        });

        // # Change role to Member
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Member
        cy.findByTestId('current-role').should('have.text', 'Member');

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
                waitUntilConfigSave();
            }
        });

        // # Wait to ensure it has saved before reloading
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Reload to ensure it's been saved
        cy.reload();

        // * Assert that the group was removed successfully
        cy.get('#groups-list--body').then((el) => {
            expect(el[0].childNodes[0].innerText).equal('No groups specified yet');
        });
    });

    it('MM-21789 - Add a group and change the role and then save and ensure the role was updated on channel configuration page', () => {
        const channelName = 'autem';
        cy.apiLogin('sysadmin');

        // # Go to system admin page and to channel configuration page of channel "autem"
        cy.visit('/admin_console/user_management/channels');

        // # Search for the channel.
        cy.findByTestId('search-input').type(`${channelName}{enter}`);
        cy.findByTestId(`${channelName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Remove all exisiting groups
        cy.get('#groups-list--body').then((el) => {
            if (el[0].childNodes[0].innerText !== 'No groups specified yet') {
                for (let i = 0; i < el[0].childNodes.length; i++) {
                    cy.get('#group-actions').click();
                }

                // # Save the setting
                cy.get('#saveSetting').click();
                waitUntilConfigSave();
            }
        });

        // # Add the first group in the group list then save
        cy.findByTestId('add-group').click();
        cy.get('#multiSelectList').first().click();
        cy.get('#saveItems').click();

        // * Ensure default role is Member
        cy.findByTestId('current-role').should('have.text', 'Member').click();

        // * Assert that only one option exists in the dropdown for changing roles
        cy.get('#role-to-be-menu').then((el) => {
            expect(el[0].firstElementChild.children.length).equal(1);
        });

        // # Continue changing the role to Team Admin
        cy.get('#role-to-be').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // * Check to make the the current role text is displayed as Channel Admin
        cy.findByTestId('current-role').should('have.text', 'Channel Admin');
    });
});
