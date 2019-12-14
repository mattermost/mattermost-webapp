// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : <MatterMostWebAppsLocation>e2e/cypress/fixtures/drawPlugin-binary.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw plugin : Post message', () => {
    before(() => {
        //Login with admin access -> enable Draw plugin
        cy.apiLogin('sysadmin').visit('/');
        cy.switchToPluginManagementEnableDisableDraw('Enable', fileName, fileType);

        // # Login with user-1
        cy.apiLogin('user-1').visit('/');
        cy.visit('/ad-1/channels/town-square');
    });

    after(() => {
        //Login with admin access -> Remove Draw plugin once tests are done
        cy.apiLogin('sysadmin').visit('/');
        cy.switchToPluginManagementEnableDisableDraw('Remove', fileName, fileType);
        cy.apiLogout();
    });

    it('M11759-Draw plugin : Post message check for Draw Plugin & My Computer events', () => {
        //Assertion 1 : Upload Image and check Message doesnt post
        //Steps : Open Channel - Draft msg - Click on draw plugin - Upload file - validate text
        openDrawPluginMenuOptions();
        cy.get('#drawPaintBrush').click();
        cy.get('canvas').trigger('pointerdown').trigger('pointerup').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');
        validatePostMessageOnUploadCancelOperations('Upload');

        //Assertion 2 :Cancel draw plugin upload and check Message doesnt post
        //Steps : Open Channel - Draft msg - Click on draw plugin - click on cancel - validate post
        openDrawPluginMenuOptions();
        cy.get('#drawPaintBrush').click();
        validatePostMessageOnUploadCancelOperations('Cancel');

        //Assertion 3 : click on Your Computer and check message doesnt post
        //Steps : Validate draft message doesn't post to channel
        openDrawPluginMenuOptions();
        cy.get('#yourComputer').click();
        getPostTextBox().should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');

        //Logout from current user
        cy.apiLogout();
    });
});

// Holds locator for posting message
const getPostTextBox = () => {
    return cy.get('#post_textbox');
};

/**
 * Method to validate Post message on performin upload and cancel operations in Draw plugin screen
 * @param {*} buttonClassName  - > Upload or Cancel Element locator
 */
function validatePostMessageOnUploadCancelOperations(locateByText) {
    cy.findByText(locateByText).should('be.visible').click();
    getPostTextBox().
        should('be.visible').wait(TIMEOUTS.TINY).
        should('have.text', 'This check is for draw plugin');
}

/**
 * Method to clear text and open draw plugin menu
 */
function openDrawPluginMenuOptions() {
    // Clear saved draft message - Click on upload option
    getPostTextBox().clear().type('This check is for draw plugin');
    cy.get('#fileUploadButton').wait(TIMEOUTS.TINY).click();
}

/**
 * Method to Switch to Plugin Management - Upload/Disable/Enable Elements
 */
Cypress.Commands.add('switchToPluginManagementEnableDisableDraw', (status, fileName, fileType) => {
    cy.navigateToSystemConsoleFromAdminSettings();
    cy.searchForPluginManagementSysConsole();
    cy.enableDisableDrawPlugin(status, fileName, fileType);
});

/**
* Section holds constants which are required for this spec
*/
const fileName = 'drawPlugin-binary.tar.gz';
const fileType = 'application/gzip';
