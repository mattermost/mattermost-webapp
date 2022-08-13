// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

describe('Settings > Display > Message Display', () => {
    before(() => {
        // # Login as new user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
        goToMessageDisplaySetting();
    });

    it('MM-T4984_1 Message Display: colorize usernames option should not exist in Compact mode', () => {
        // * Verify 'Standard' is selected
        cy.findByRole('heading', {name: 'Message Display'}).click();
        cy.findByRole('radio', {
            name: 'Standard: Easy to scan and read.',
        }).click();

        // * Verify Colorize usernames option doesn't exist;
        cy.findByRole('checkbox', {
            name: 'Colorize usernames: Use colors to distinguish users in compact mode',
        }).should('not.exist');
    });
    it('MM-T4984_2 Message Display: colorize usernames option should exist in Compact mode', () => {
        // * Verify 'Standard' is selected
        cy.findByRole('heading', {name: 'Message Display'}).click();
        cy.findByRole('radio', {
            name: 'Compact: Fit as many messages on the screen as we can.',
        }).click();

        // * Verify Colorize usernames option exists;
        cy.findByRole('checkbox', {
            name: 'Colorize usernames: Use colors to distinguish users in compact mode',
        }).should('exist');

        // # Save and close the modal
        cy.uiSave();
        cy.uiClose();
    });
});

function goToMessageDisplaySetting() {
    // # Go to Settings modal - Display section - Message Display
    cy.uiOpenSettingsModal('Display').within(() => {
        cy.get('#displayButton').click();
        cy.get('#message_displayEdit').should('be.visible');
        cy.get('#message_displayEdit').click();

        // cy.get('#accountSettingsHeader > .close').should('be.visible');
    });
}

// # Open Settings > Display > Themes
// cy.uiOpenSettingsModal('Display').within(() => {
//     cy.get('#displayButton').click();
//     cy.get('#displaySettingsTitle').should('exist');
//     cy.get('#themeTitle').scrollIntoView().should('be.visible');
//     cy.get('#themeEdit').click();

//     // * Verify image alt in Theme Images
//     cy.get('#displaySettings').within(() => {
//         cy.get('.appearance-section>div').children().each(($el) => {
//             cy.wrap($el).get('#denim-theme-icon').should('have.text', 'Denim theme icon');
//         });
//     });
// });
