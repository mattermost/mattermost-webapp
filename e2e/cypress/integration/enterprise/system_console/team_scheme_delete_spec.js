// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const deleteExistingTeamOverrideSchemes = () => {
    cy.apiGetSchemes('team').then((res) => {
        res.body.forEach((scheme) => {
            cy.apiDeleteScheme(scheme.id);
        });
    });
};

describe('Team Scheme Channel Mentions Permissions Test', () => {
    before(() => {
        // # Login as sysadmin and navigate to system scheme page
        cy.apiLogin('sysadmin');

        // * Check if server has license
        cy.requireLicense();

        // Delete any existing team override schemes
        deleteExistingTeamOverrideSchemes();

        // # Visit the permissions page
        cy.visit('/admin_console/user_management/permissions');
    });

    after(() => {
        // # Login as sysadmin and navigate to system scheme page
        cy.apiLogin('sysadmin');
        deleteExistingTeamOverrideSchemes();
    });

    it('Create and delete team override scheme', () => {
        for (let i = 0; i < 100; i ++) {
            // # Visit the permissions page
            cy.visit('/admin_console/user_management/permissions/team_override_scheme');

            // # Give the new team scheme a name
            cy.get('#scheme-name').type('Test Team Scheme');

            // # Assign the new team scheme to the eligendi team using the add teams modal
            cy.findByTestId('add-teams').click();

            cy.get('#selectItems').type('eligendi');

            cy.get('.team-info-block').then((el) => {
                el.click();
            });

            cy.get('#saveItems').click();

            // # Save config
            cy.get('#saveSetting').click();

            // * Ensure that the team scheme was created and assigned to the team
            cy.findByTestId('Test Team Scheme-delete').click();
            cy.get('#confirmModalButton').click();
        }
    });
});
