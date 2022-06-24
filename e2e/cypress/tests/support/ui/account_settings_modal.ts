// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ChainableT} from '../api/types';

function uiOpenProfileModal(section = ''): ChainableT<JQuery> {
    // # Open profile settings modal
    cy.uiOpenUserMenu('Profile');

    const profileSettingsModal = () => cy.findByRole('dialog', {name: 'Profile'}).should('be.visible');

    if (!section) {
        return profileSettingsModal();
    }

    // # Click on a particular section
    cy.findByRoleExtended('button', {name: section}).should('be.visible').click();

    return profileSettingsModal();
}
Cypress.Commands.add('uiOpenProfileModal', uiOpenProfileModal);

function verifyAccountNameSettings(firstname: string, lastname: string) {
    // # Go to Profile
    cy.uiOpenProfileModal();

    // * Check name value
    cy.get('#nameDesc').should('have.text', `${firstname} ${lastname}`);
    cy.uiClose();
}
Cypress.Commands.add('verifyAccountNameSettings', verifyAccountNameSettings);

function uiChangeGenericDisplaySetting(setting: string, option: string) {
    cy.uiOpenSettingsModal('Display');
    cy.get(setting).scrollIntoView();
    cy.get(setting).click();
    cy.get('.section-max').scrollIntoView();

    cy.get(option).check().should('be.checked');

    cy.uiSaveAndClose();
}
Cypress.Commands.add('uiChangeGenericDisplaySetting', uiChangeGenericDisplaySetting);

function uiChangeMessageDisplaySetting(setting = 'STANDARD') {
    const SETTINGS = {STANDARD: '#message_displayFormatA', COMPACT: '#message_displayFormatB'};
    cy.uiChangeGenericDisplaySetting('#message_displayTitle', SETTINGS[setting]);
}
Cypress.Commands.add('uiChangeMessageDisplaySetting', uiChangeMessageDisplaySetting);

/*
 * Change the collapsed reply threads display setting
 * @param {String} setting - as 'OFF' or 'ON'
 */
function uiChangeCRTDisplaySetting(setting = 'OFF') {
    const SETTINGS = {
        ON: '#collapsed_reply_threadsFormatA',
        OFF: '#collapsed_reply_threadsFormatB',
    };

    cy.uiChangeGenericDisplaySetting('#collapsed_reply_threadsTitle', SETTINGS[setting]);
}
Cypress.Commands.add('uiChangeCRTDisplaySetting', uiChangeCRTDisplaySetting);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Open the account settings modal
             * @param {string} section - such as `'General'`, `'Security'`, `'Notifications'`, `'Display'`, `'Sidebar'` and `'Advanced'`
             * @return the "#accountSettingsModal"
             *
             * @example
             *   cy.uiOpenProfileModal().within(() => {
             *       // Do something here
             *   });
             */
            uiOpenProfileModal(): Chainable;

            /**
             * Close the account settings modal given that the modal itself is opened.
             *
             * @example
             *   cy.uiCloseAccountSettingsModal();
             */
            uiCloseAccountSettingsModal(): Chainable;

            /**
             * Navigate to account settings and verify the user's first, last name
             * @param {String} firstname - expected user firstname
             * @param {String} lastname - expected user lastname
             */
            verifyAccountNameSettings(firstname: string, lastname: string): ChainableT<void>;

            /**
             * Navigate to account display settings and change collapsed reply threads setting
             * @param {String} setting -  ON or OFF
             */
            uiChangeCRTDisplaySetting(setting: string): ChainableT<void>;

            /**
             * Navigate to account display settings and change message display setting
             * @param {String} setting -  COMPACT or STANDARD
             */
            uiChangeMessageDisplaySetting(setting: string): ChainableT<void>;

            uiChangeGenericDisplaySetting(setting: string, option: string): ChainableT<void>;
        }
    }
}
