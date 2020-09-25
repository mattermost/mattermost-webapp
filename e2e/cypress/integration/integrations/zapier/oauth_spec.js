// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import {checkboxesTitleToIdMap} from '../../enterprise/system_console/channel_moderation/constants';

import {
    enablePermission,
    goToSystemScheme,
    saveConfigForScheme,
} from '../../enterprise/system_console/channel_moderation/helpers';

describe('Integrations page', () => {
    let user1;
    let testChannelUrl1;

    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableOAuthServiceProvider: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiInitSetup().then(({team, user}) => {
            user1 = user;
            testChannelUrl1 = `/${team.name}/channels/town-square`;
        });

        goToSystemScheme();
        enablePermission(checkboxesTitleToIdMap.ALL_USERS_MANAGE_OAUTH_APPLICATIONS);
        saveConfigForScheme();
    });

    it('MM-T646 OAuth 2.0 trusted', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # Navigate to OAuthApps in integrations menu
        cy.get('#headerInfo').click();
        cy.get('#integrations').click();
        cy.get('#oauthApps').click();

        // # Click on the Add button
        cy.get('#addOauthApp').click();

        // * Should not find is trusted
        cy.findByText('Is Trusted').should('not.exist');

        // * First child should be Display Name
        cy.get('div.backstage-form > form > div:first').should('contain', 'Display Name');
    });

    it('MM-T647 Copy icon for OAuth 2.0 Applications', () => {
        cy.apiLogin(user1);
        cy.visit(testChannelUrl1);

        // # Navigate to OAuthApps in integrations menu
        cy.get('#headerInfo').click();
        cy.get('#integrations').click();
        cy.get('#oauthApps').click();

        // # Click on the Add button
        cy.get('#addOauthApp').click();

        // # Fill all fields
        cy.get('#name').type('Test');
        cy.get('#description').type('Test');
        cy.get('#homepage').type('https://www.test.com/');
        cy.get('#callbackUrls').type('https://www.test.com/');

        // # Save
        cy.get('#saveOauthApp').click();

        // * Copy button should be visible
        cy.get('.fa-copy').should('exist');

        // # Store client ID
        cy.findByText('Client ID').parent().invoke('text').then((text) => {
            cy.wrap(text.substring(3)).as('clientID');
        });

        // # Click Done
        cy.get('#doneButton').click();

        cy.get('@clientID').then((clientID) => {
            cy.contains('.item-details', clientID).within(() => {
                // * Copy button should exist for Client ID
                cy.contains('.item-details__token', 'Client ID').within(() => {
                    cy.get('.fa-copy').should('exist');
                });

                cy.contains('.item-details__token', 'Client Secret').within(() => {
                    // * Client secret should not show
                    cy.contains('*******************').should('exist');

                    // * Copy button should not exist
                    cy.get('.fa-copy').should('not.exist');
                });

                // # Show secret
                cy.findByText('Show Secret').click();

                // * Show secret text should have changed to Hide Secret
                cy.findByText('Hide Secret').should('exist');
                cy.findByText('Show Secret').should('not.exist');

                cy.contains('.item-details__token', 'Client Secret').within(() => {
                    // * Token should not be obscured
                    cy.contains('*******************').should('not.exist');

                    // * Copy button should exist
                    cy.get('.fa-copy').should('exist');
                });
            });
        });
    });
});
