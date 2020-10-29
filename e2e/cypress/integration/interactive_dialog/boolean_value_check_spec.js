 
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

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
        cy.findByTestId('someemailemail').type('test@mattermost.com');
        cy.findByTestId('somepasswordpassword').type('testpassword');
        cy.findByTestId('somenumbernumber').type('42');
        cy.findAllByPlaceholderText('Select an option...', {multiple: true}).click({multiple: true}).then(() => {
            cy.findAllByText('Option1', {multiple: true}).click({multiple: true});
        })
    });
});
