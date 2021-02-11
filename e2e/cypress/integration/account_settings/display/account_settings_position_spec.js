// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

describe('Account Settings > General > Position', () => {
    let testTeam;
    let testUser;
    const position = 'Master hacker';

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.apiLogin(testUser);

            // # Visit town square
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T2063 Position', () => {
        // # Open 'Account Settings' modal and view the default 'General Settings'
        cy.uiOpenAccountSettingsModal().within(() => {
            // # Open 'Position' setting
            cy.findByRole('heading', {name: 'Position'}).should('be.visible').click();

            // # Enter new 'Position'
            cy.findByRole('textbox', {name: 'Position'}).should('be.visible').type(position);

            // # Save and close the modal
            cy.uiSaveAndClose();
        });

        // # Post message in the main channel
        cy.postMessage('hello from master hacker');

        // # Click on the profile image
        cy.get('.profile-icon > img').as('profileIconForPopover').click();

        // # Verify that the popover is visible and contains position
        cy.contains('#user-profile-popover', 'Master hacker').should('be.visible');
    });

    it('MM-T2064 Position / 128 characters', () => {
        const longPosition = 'Master Hacker II'.repeat(8);

        // # Open 'Account Settings' modal and view the default 'General Settings'
        cy.uiOpenAccountSettingsModal().within(() => {
            const minPositionHeader = () => cy.findByRole('heading', {name: 'Position'});
            const maxPositionInput = () => cy.findByRole('textbox', {name: 'Position'});

            // # Fill-in the position field with a value of 128 characters
            minPositionHeader().click();
            maxPositionInput().type(longPosition);
            cy.uiSave();
            maxPositionInput().should('not.exist');

            minPositionHeader().click();
            maxPositionInput().invoke('val').then((val) => {
                // * Verify that the input value is 128 characters
                expect(val.length).to.equal(128);
            });

            // # Try to edit the field with maximum characters
            maxPositionInput().focus().type('random');
            maxPositionInput().invoke('val').then((val) => {
                // * Verify that the position hasn't changed
                expect(val).to.equal(longPosition);
            });

            // # Save position
            cy.uiSave();
        });
    });
});
