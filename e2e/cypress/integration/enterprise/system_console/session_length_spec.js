// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @system_console

// # Goes to the System Scheme page as System Admin
const goToSessionLengths = () => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/environment/session_lengths');
};

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

// Clicks the save button in the system console page.
// waitUntilConfigSaved: If we need to wait for the save button to go from saving -> save.
// Usually we need to wait unless we are doing this in team override scheme
const saveConfig = (waitUntilConfigSaved = true, clickConfirmationButton = false) => {
    // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
    cy.get('#saveSetting').then((btn) => {
        if (btn.is(':enabled')) {
            btn.click();
        }
    });
    if (clickConfirmationButton) {
        cy.get('#confirmModalButton').click();
    }
    if (waitUntilConfigSaved) {
        waitUntilConfigSave();
    }
};

describe('Session Lengths', () => {
    before(() => {
        cy.requireLicense();
        goToSessionLengths();
    });

    describe('"Extend session length with activity" defaults to true', () => {
        it('"Extend session length with activity" radio is checked', () => {
            cy.get('#extendSessionLengthWithActivitytrue').check().should('be.checked');
        });
        it('"Session idle timeout" setting should not exist', () => {
            cy.get('#sessionIdleTimeoutInMinutes').should('not.exist');
        });
    });

    describe('Setting "Extend session length with activity" to false alters subsequent settings', () => {
        before(() => cy.get('#extendSessionLengthWithActivityfalse').check());
        it('In enterprise edition, "Session idle timeout" setting should exist on page', () => {
            cy.get('#sessionIdleTimeoutInMinutes').should('exist');
        });
    });

    describe('Session Lengths settings should save successfully', () => {
        before(() => cy.get('#extendSessionLengthWithActivityfalse').check());
        it('Setting "Session Idle Timeout (minutes)" should save in UI', () => {
            cy.get('#sessionIdleTimeoutInMinutes').
                should('have.value', '43200').
                clear().type('43201');
            saveConfig();
            cy.get('#sessionIdleTimeoutInMinutes').should('have.value', '43201');
        });
        it('Setting "Session Cache (minutes)" should be saved in the server configuration', () => {
            cy.apiGetConfig().then((response) => {
                const setting = response.body.ServiceSettings.SessionIdleTimeoutInMinutes;
                expect(setting).to.equal(43201);
            });
        });
    });
});