// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw plugin : Post message', () => {
    before(() => {
        //Login with admin access -> enable Draw plugin
        cy.apiLogin('sysadmin').visit('/');
        cy.switchToPluginManagementEnableDisableDraw('Enable',fileName,fileType)
        // # Login, set display preference and go to /
        cy.apiLogin('user-1').visit('/');
        cy.apiSaveMessageDisplayPreference();
    });

    after(() => {
        // # Restore default configuration 
        const newSettings = {
            PluginSettings: {
                Enable: true,
                EnableMarketplace: true,
                MarketplaceUrl: 'https://api.integrations.mattermost.com',
            },
        };
         //Login with admin access -> Remove Draw plugin once tests are done
        cy.apiLogin('sysadmin').visit('/');
        cy.switchToPluginManagementEnableDisableDraw('Remove',fileName,fileType)
        cy.apiUpdateConfig(newSettings);
    });

    beforeEach(function () {       
        // Visit Default channel - Clear saved draft message - Click on upload option
        cy.visit('/ad-1/channels/town-square');
        getPostTextBox().clear().type("This check is for draw plugin");
        cy.get('#fileUploadButton.icon.icon--attachment').wait(TIMEOUTS.TINY).click();
    })
    // **************Test Case 1 : **************
    // Step 1 : Open Channel - Draft Messgae -Click on Draw plugin 
    // Step 2 : Set Dot on canvas - Click on upload 
    // Step 3 : Validate draft message doesn't post to channel

    it('M11759-Draw plugin : Upload Image and check Message doesnt post', function () {
        cy.get('i.icon.fa.fa-paint-brush').click();
        cy.get("canvas").trigger('pointerdown').trigger('pointerup').click();
        cy.get(`#post_textbox`).
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');
        validatePostMessageOnUploadCancelOperations('button.btn.btn-primary');
        
    })

    // **************Test Case 2 : ************** 
    // Step 1 : Open Channel - Draft message -Click on Draw plugin 
    // Step 2 : Click on cancel 
    // Step 3 : Validate draft message doesn't post to channel

    it('M11759-Draw plugin : Cancel draw plugin upload and check Message doesnt post', function () {        
        cy.get('i.icon.fa.fa-paint-brush').click();
        validatePostMessageOnUploadCancelOperations('button.btn.btn-cancel');
    })

      // **************Test Case 3 : ************** 
    // Step 1 : Open Channel - Draft message -Click on your computer icon 
    // Step 2 : Validate draft message doesn't post to channel

    it('M11759-Draw plugin : click on Your Computer', function () {
        cy.get('span.margin-right').should('be.visible').find('i.fa.fa-laptop').click();
            getPostTextBox().should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');
    })

});

    const getPostTextBox = () => {
        return cy.get('#post_textbox');
    };           

    function validatePostMessageOnUploadCancelOperations(buttonClassName){
        cy.get(buttonClassName).
        should('be.visible').
        click();
        getPostTextBox().
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');

    }
    /**
    * Section holds constants which are required for this spec
    */
    const subject='cypress/fixtures/matterMost.tar.gz';
    const fileName = 'cypress/fixtures/matterMost.tar.gz';
    const fileType = 'application/gzip';
