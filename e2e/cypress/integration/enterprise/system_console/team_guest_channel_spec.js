// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {getRandomInt} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

const permissions = ['create_private_channel', 'edit_post', 'delete_post', 'reactions', 'use_channel_mentions'];

const disableAllGuestPermissions = () => {
    permissions.forEach((permission) => {
        let buttonId = "guests-" + permission + "-checkbox"
        cy.findByTestId(buttonId).then((btn) => {
            if (btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

const enableAllGuestPermissions = () => {
    permissions.forEach((permission) => {
        let buttonId = "guests-" + permission + "-checkbox"
        cy.findByTestId(buttonId).then((btn) => {
            if (!btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

const verifyAllGuestPermissions = (selected) => {
    permissions.forEach((permission) => {
        let buttonId = "guests-" + permission + "-checkbox"
        if(selected){
            cy.findByTestId(buttonId).should('have.class', 'checked');
        } else {
            cy.findByTestId(buttonId).should('not.have.class', 'checked');
        }
    });
};

describe('Team Scheme Guest Permissions Test', () => {
    before(() => {
        // * Check if server has license
        cy.requireLicense();
        cy.apiLogin('sysadmin');
    });

    it('MM- - Enable and Disable all guest permission', () => {
        // # Go to team override scheme.
        cy.visit('/admin_console/user_management/permissions/team_override_scheme');

        // # create unique scheme name
        const uniqueNumber = getRandomInt(1000);
        cy.get('#scheme-name').type(`TestScheme-${uniqueNumber}{enter}`);

        // // # Wait until the groups retrieved and show up
        // cy.wait(TIMEOUTS.TINY); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Check all the boxes currently unchecked
        enableAllGuestPermissions();

        // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
        cy.get('#saveSetting').click().wait(TIMEOUTS.TINY);

        // # Reload the team scheme.
        cy.findByText(`TestScheme-${uniqueNumber}`).siblings('.actions').children('.edit-button').click().wait(TIMEOUTS.TINY);

        // * Ensure all checkboxes are checked
        verifyAllGuestPermissions(true);

        // # Uncheck all the boxes currently checked
        disableAllGuestPermissions();

        // # Save the page
        cy.get('#saveSetting').click().wait(TIMEOUTS.TINY);

        // #Reload the team scheme.
        cy.findByText(`TestScheme-${uniqueNumber}`).siblings('.actions').children('.edit-button').click().wait(TIMEOUTS.TINY); 

        // * Ensure all checkboxes have the correct unchecked state
        verifyAllGuestPermissions(false);

        cy.get('.cancel-button').click();

        //Clean up - Delete scheme
        cy.findByText(`TestScheme-${uniqueNumber}`).siblings('.actions').children('.delete-button').click().wait(TIMEOUTS.TINY);
        cy.get('#confirmModalButton').click();

    });
});
