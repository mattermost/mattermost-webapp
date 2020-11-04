// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    let testChannel;

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testChannel = channel;

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
        cy.apiAdminLogin();
        cy.apiRemovePluginById('com.mattermost.demo-plugin');
    });

    it('MM-T2503 Boolean value check', () => {
        // * Open the /dialog box and complete the form with boolean values set to True where possible
        cy.postMessage('/dialog');
        cy.findAllByTestId('someemailemail').type('test@mattermost.com');
        cy.findAllByTestId('somepasswordpassword').type('testpassword');
        cy.findAllByTestId('somenumbernumber').type('42');
        cy.get(':nth-child(8) > :nth-child(2) > .select-suggestion-container > :nth-child(2) > .form-control').type('{downarrow}{enter}');

        // # Enable to true
        cy.get('#someboolean').click().should('be.checked');

        // # Enables to true
        cy.get('#someboolean_optional').click().should('be.checked');

        // # Check that it is already enabled as true
        cy.get('#someboolean_default_true').should('be.checked');

        // # Check that it is already enabled as true
        cy.get('#someboolean_default_true_optional').should('be.checked');

        // # Enable to true
        cy.get('#someboolean_default_false').click().should('be.checked');

        // # Enable to true
        cy.get('#someboolean_default_false_optional').click().should('be.checked');

        // # Check the radio box
        cy.get('[value="opt1"]').click().should('be.checked');

        // # Save the form and submit
        cy.get('#interactiveDialogSubmit').click();

        // # Waits for bot post with boolean values
        cy.waitUntil(() => cy.getLastPost().then((el) => {
            const postedMessageEl = el.find('.post__body')[0];
            return Boolean(postedMessageEl && postedMessageEl.textContent.includes('Data:'));
        }));

        // * Assert that values are boolean e.g. true not "true"
        cy.get('.post__body').should('be.visible').and('contain.text', ' "someboolean_default_false": true').and('contain.text', ' "someboolean_default_false_optional": true').and('contain.text', ' "someboolean_default_true": true').and('contain.text', ' "someboolean_default_true_optional": true').and('contain.text', ' "someboolean_optional": true');

        // ================================

        // * Open the /dialog box and complete the form with boolean values set to False where possible
        cy.postMessage('/dialog');
        cy.findAllByTestId('someemailemail').type('test@mattermost.com');
        cy.findAllByTestId('somepasswordpassword').type('testpassword');
        cy.findAllByTestId('somenumbernumber').type('42');
        cy.get(':nth-child(8) > :nth-child(2) > .select-suggestion-container > :nth-child(2) > .form-control').type('{downarrow}{enter}');

        // # Enable to true (required)
        cy.get('#someboolean').click().should('be.checked');

        // # Check that it is set to false
        cy.get('#someboolean_optional').should('not.be', 'checked');

        // # Check that it is set to true (required)
        cy.get('#someboolean_default_true').should('be.checked');

        // # Un-check so that it is set to false
        cy.get('#someboolean_default_true_optional').click().should('not.be', 'checked');

        // # Enable to true (required)
        cy.get('#someboolean_default_false').click().should('be.checked');

        // # Check that it is set to false
        cy.get('#someboolean_default_false_optional').should('not.be', 'checked');

        // # Check the radio box
        cy.get('[value="opt1"]').click().should('be.checked');

        // # Save the form and submit
        cy.get('#interactiveDialogSubmit').click();

        // # Waits for bot post with boolean values
        cy.waitUntil(() => cy.getLastPost().then((el) => {
            const postedMessageEl = el.find('.post__body')[0];
            return Boolean(postedMessageEl && postedMessageEl.textContent.includes('Data:'));
        }));

        // * Assert that values are boolean e.g. false not "false"
        cy.get('.post__body').should('be.visible').and('contain.text', ' "someboolean_default_false_optional": false').and('contain.text', ' "someboolean_default_true_optional": false').and('contain.text', ' "someboolean_optional": false');
    });
});
