// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

describe('Banner - Subscription scenarios', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    describe('Banner - UI validations', () => {
        it('MM-T4422 Cloud trial prompts for admin login', () => {
            // # Login as sysadmin
            cy.apiAdminLogin();

            cy.apiInitSetup().then(({team}) => {
                // # Go to town square
                cy.visit(`/${team.name}/channels/town-square`);
            });

            // * Check for Town Square header
            cy.get('#channelHeaderTitle').should('exist').
                contains('span', 'Town Square').should('be.visible');

            cy.get('.announcement-bar__text').should('exist').within(() => {
                // * Check for 'Your trial has started!' in banner message
                cy.contains('span', 'days left on your Cloud trial').should('be.visible');
            });

            // # Click 'Subscribe now' button in banner message
            cy.contains('span', 'Subscribe Now').parent().should('be.enabled').click();

            // * Check for existence of 'Provide Your Payment Details' label
            cy.contains('span', 'Provide Your Payment Details').should('be.visible');

            //# Click close button in Subscribe modal
            cy.get('#closeIcon').click();

            // * Check for 'Your trial has started!' in banner message
            cy.contains('span', 'days left on your Cloud trial').should('be.visible');

            // # Click close mark
            cy.get('.announcement-bar__close').click();

            // * Check for non existence of trail banner
            cy.contains('span', 'days left on your Cloud trial').should('not.exist');

            // # Click on 'Channels' label
            cy.contains('h1', 'Channels').should('exist').click();

            // * Check for existence of trail banner in Global Header
            cy.contains('span', 'your Cloud trial').should('be.visible');

            // # Click 'Subscribe Now' button in Global Header
            cy.contains('button', 'Subscribe Now').should('be.visible').click();

            // * Check for existence of 'Provide Your Payment Details' label
            cy.contains('span', 'Provide Your Payment Details').should('be.visible');

            //# Click close button in Subscribe modal
            cy.get('#closeIcon').click();

            // * Check for 'Your trial has started!' in banner message
            cy.contains('span', 'days left on your Cloud trial').should('be.visible');
            cy.uiLogout();
        });

        it('MM-T4421 Non existence of Cloud trial prompts for non admin login', () => {
            let testTeam;
            let testUser;

            // # Login as sysadmin
            cy.apiAdminLogin();

            // # Login as test user and visit town-square
            cy.apiInitSetup().then(({team, user}) => {
                testTeam = team;
                testUser = user;
            });

            // # Create a new user
            cy.apiCreateUser({prefix: 'nonAdminUser'}).then(({user}) => {
                // # Add user to the team
                cy.apiAddUserToTeam(testTeam.id, user.id).then(() => {
                    // # Login as new team admin
                    cy.apiLogin(testUser);

                    // # Go to town square
                    cy.visit(`/${testTeam.name}/channels/town-square`);

                    // * Check for non existence of trail banner
                    cy.get('.announcement-bar__text').should('not.exist');

                    // # Click on 'Channels' label
                    cy.contains('h1', 'Channels').should('exist').click();

                    // * Check for non existence of trail banner in Global Header
                    cy.contains('span', 'your Cloud trial').should('not.exist');

                    // * Check for non existence of 'Subscribe Now' button in Global Header
                    cy.contains('button', 'Subscribe Now').should('not.exist');
                    cy.uiLogout();
                });
            });
        });
    });
});
