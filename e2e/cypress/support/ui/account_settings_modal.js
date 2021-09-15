// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiOpenAccountSettingsModal', (section = '') => {
    // # Open account settings modal
    cy.uiGetSetStatusButton().click();
    cy.findByRole('button', {name: 'Account Settings dialog'}).click();

    const accountSettingsModal = () => cy.findByRole('dialog', {name: 'Account Settings'}).should('be.visible');

    if (!section) {
        return accountSettingsModal();
    }

    // # Click on a particular section
    cy.findByRoleExtended('button', {name: section}).should('be.visible').click();

    return accountSettingsModal();
});

Cypress.Commands.add('verifyAccountNameSettings', (firstname, lastname) => {
    // # Go to Account Settings
    cy.uiOpenAccountSettingsModal();

    // * Check name value
    cy.get('#nameDesc').should('have.text', `${firstname} ${lastname}`);
    cy.uiClose();
});

Cypress.Commands.add('uiChangeGenericDisplaySetting', (setting, option) => {
    cy.uiOpenAccountSettingsModal('Display');
    cy.get(setting).scrollIntoView();
    cy.get(setting).click();
    cy.get('.section-max').scrollIntoView();

    cy.get(option).check().should('be.checked');

    cy.get('#saveSetting').click();
    cy.get('#accountSettingsHeader > .close').click();
});

/*
 * Change the message display setting
 * @param {String} setting - as 'STANDARD' or 'COMPACT'
 */
Cypress.Commands.add('uiChangeMessageDisplaySetting', (setting = 'STANDARD') => {
    const SETTINGS = {STANDARD: '#message_displayFormatA', COMPACT: '#message_displayFormatB'};
    cy.uiChangeGenericDisplaySetting('#message_displayTitle', SETTINGS[setting]);
});

/*
 * Change the collapsed reply threads display setting
 * @param {String} setting - as 'OFF' or 'ON'
 */
Cypress.Commands.add('uiChangeCRTDisplaySetting', (setting = 'OFF') => {
    const SETTINGS = {
        ON: '#collapsed_reply_threadsFormatA',
        OFF: '#collapsed_reply_threadsFormatB',
    };

    cy.uiChangeGenericDisplaySetting('#collapsed_reply_threadsTitle', SETTINGS[setting]);

    if (setting === 'ON') {
        cy.uiCloseModal('You\'re accessing an early beta of Collapsed Reply Threads');
    }
});
