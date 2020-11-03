 
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';


describe('Messaging', () => {
    let testTeam;
    let testChannel;

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testTeam = team;
            testChannel = channel

            // # Set up Demo plugin
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz', true);
            cy.apiEnablePluginById('com.mattermost.demo-plugin');

            // # Login as regular user
            cy.apiLogin(user);
            cy.visit(`/${team.name}/channels/${testChannel.name}`);
        });
    });

    after(() => {
        // # Clean up - remove demo plugin
        //cy.apiAdminLogin();
        //cy.apiRemovePluginById('com.mattermost.demo-plugin');
    });

    it('MM-T2503 Boolean value check', () => {
        // * Open the /dialog box and complete the form
        cy.postMessage('/dialog');
        cy.findAllByTestId('someemailemail').type('test@mattermost.com');
        cy.findAllByTestId('somepasswordpassword').type('testpassword');
        cy.findAllByTestId('somenumbernumber').type('42');
        
        cy.get(':nth-child(8) > :nth-child(2) > .select-suggestion-container > :nth-child(2) > .form-control').type('{downarrow}{enter}');
        
        cy.get('#someboolean').click(); //enables to true
        //cy.get('#someboolean').click(); //enables to true
        
        cy.get('#someboolean_optional').click(); // enables to true
        //cy.findByTestId('someboolean_optional').click(); // enables to true
        
        cy.get('#someboolean_default_true').should('be.checked'); // checks that is is already enabled
        //cy.findByTestId('someboolean_default_true').click(); // checks that is is already enabled

        cy.get('#someboolean_default_true_optional').should('be.checked'); // checks that it is already enabled
        //cy.findByTestId('someboolean_default_true_optional').click(); // checks that it is already enabled

        cy.get('#someboolean_default_false').click() // enables to true
        //cy.findByTestId('someboolean_default_false').click() // enables to true

        cy.get('#someboolean_default_false_optional').click() // enables to true
        //cy.findByTestId('someboolean_default_false_optional').click() // enables to true

        // # Check the radio box 
        cy.get('[value="opt1"]').click();

        // # Save the form and submit
        cy.get('#interactiveDialogSubmit').click();

        cy.waitUntil(() => cy.getLastPost().then((el) => {
            const postedMessageEl = el.find('.post__body')[0];
            return Boolean(postedMessageEl && postedMessageEl.textContent.includes('Data:'));
        }));
        //cy.get('.post__body').should('be.visible').and('contain.text', ` "someboolean_default_false": true,`).and('contain.text', ` "someboolean_default_false_optional": true,`);
    });
});     
