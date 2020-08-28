// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility

import * as TIMEOUTS from '../../fixtures/timeouts';
import accountSettingSections from '../../fixtures/account_setting_sections.json';

function verifySections(sections) {
    // * Verify Accessibility support in the specified sections
    sections.forEach((section, index) => {
        cy.get('.user-settings').then((el) => {
            // # Skip the section if the specified section is not displayed
            if (el.find(`#${section.key}Edit`).length) {
                cy.get(`#${section.key}Edit`).should('have.attr', 'aria-labelledby', `${section.key}Title ${section.key}Edit`).and('have.class', 'a11y--active a11y--focused').and('have.text', 'Edit');
                cy.get(`#${section.key}Title`).should('be.visible').and('contain', section.label);
                if (index < sections.length - 1) {
                    cy.focused().tab();
                }
            }
        });
    });
}

describe('Verify Accessibility Support in different sections in Account Settings Dialog', () => {
    before(() => {
        // # Update Configs
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
                ExperimentalChannelOrganization: false,
            },
            DisplaySettings: {
                ExperimentalTimezone: true,
            },
            SamlSettings: {
                Enable: false,
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Open Account Settings
        cy.toAccountSettingsModal();

        // # Wait until the content in the settings are loaded
        cy.get('.settings-content > div').should('be.visible');
    });

    afterEach(() => {
        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('MM-T1465_1 Verify Label & Tab behavior in section links', () => {
        // * Verify the aria-label and Tab support in different sections
        cy.get('body').tab();
        cy.get('#generalButton').should('have.attr', 'aria-label', 'general').focus().tab();
        cy.get('#securityButton').should('have.attr', 'aria-label', 'security').should('have.class', 'a11y--active a11y--focused').tab();
        cy.get('#notificationsButton').should('have.attr', 'aria-label', 'notifications').should('have.class', 'a11y--active a11y--focused').tab();
        cy.get('#displayButton').should('have.attr', 'aria-label', 'display').should('have.class', 'a11y--active a11y--focused').tab();
        cy.get('#sidebarButton').should('have.attr', 'aria-label', 'sidebar').should('have.class', 'a11y--active a11y--focused').tab();
        cy.get('#advancedButton').should('have.attr', 'aria-label', 'advanced').should('have.class', 'a11y--active a11y--focused').tab();
    });

    it('MM-T1465_2 Verify Accessibility Support in each section in Account Settings Dialog', () => {
        // # Tab from Advanced section
        cy.get('body').tab();
        cy.get('#generalButton').click();
        cy.get('#advancedButton').tab();

        // * Verify if the focus goes to the individual fields in General section
        verifySections(accountSettingSections.general);

        // * Verify if the focus goes to the individual fields in Security section
        cy.get('#securityButton').click();
        cy.get('#advancedButton').tab();
        verifySections(accountSettingSections.security);

        // * Verify if the focus goes to the individual fields in Notifications section
        cy.get('#notificationsButton').click();
        cy.get('#advancedButton').tab();
        verifySections(accountSettingSections.notifications);

        // * Verify if the focus goes to the individual fields in Display section
        cy.get('#displayButton').click();
        cy.get('#advancedButton').tab();
        verifySections(accountSettingSections.display);

        // * Verify if the focus goes to the individual fields in Sidebar section
        cy.get('#sidebarButton').click();
        cy.get('#advancedButton').tab();
        verifySections(accountSettingSections.sidebar);

        // * Verify if the focus goes to the individual fields in Advanced section
        cy.get('#advancedButton').click().tab();
        verifySections(accountSettingSections.advanced);
    });

    it('MM-T1481 Verify Correct Radio button behavior in Account Settings', () => {
        cy.get('#notificationsButton').click();
        cy.get('#desktopEdit').click();
        cy.get('#desktopNotificationAllActivity').check().should('be.checked').tab().check();
        cy.get('#desktopNotificationMentions').should('be.checked').tab().check();
        cy.get('#desktopNotificationNever').should('be.checked');
    });

    it('MM-T1482 Input fields in Account Settings should read labels', () => {
        accountSettingSections.general.forEach((section) => {
            if (section.type === 'text') {
                cy.get(`#${section.key}Edit`).click();
                cy.get('.setting-list-item .form-group').each(($el) => {
                    if ($el.find('input').length) {
                        cy.wrap($el).find('.control-label').invoke('text').then((label) => {
                            cy.wrap($el).find('input').should('have.attr', 'aria-label', label);
                        });
                    }
                });
            }
        });
    });

    it('MM-T1485 Language dropdown should read labels', () => {
        cy.get('#displayButton').click();
        cy.get('#languagesEdit').click();
        cy.get('#displayLanguage').within(() => {
            cy.get('input').should('have.attr', 'aria-autocomplete', 'list').and('have.attr', 'aria-labelledby', 'changeInterfaceLanguageLabel').as('inputEl');
        });
        cy.get('#changeInterfaceLanguageLabel').should('be.visible').and('have.text', 'Change interface language');

        // # When enter key is pressed on dropdown, it should expand and collapse
        cy.get('@inputEl').type('{enter}');
        cy.get('#displayLanguage>div').should('have.class', 'react-select__control--menu-is-open');
        cy.get('@inputEl').type('{enter}');
        cy.get('#displayLanguage>div').should('not.have.class', 'react-select__control--menu-is-open');

        // # Press down arrow twice and check aria label
        cy.get('@inputEl').type('{enter}');
        cy.get('@inputEl').type('{downarrow}{downarrow}');
        cy.get('#displayLanguage>span').as('ariaEl').within(($el) => {
            cy.wrap($el).should('have.attr', 'aria-live', 'assertive');
            cy.get('#aria-context').should('contain', 'option Español focused').and('contain', 'Use Up and Down to choose options, press Enter to select the currently focused option, press Escape to exit the menu, press Tab to select the option and exit the menu.');
        });

        // # Check if language setting gets changed after user presses enter
        cy.get('@inputEl').type('{enter}');
        cy.get('#displayLanguage').should('contain', 'Español');
        cy.get('@ariaEl').get('#aria-selection-event').should('contain', 'option Español, selected');

        // # Press down arrow, then up arrow and press enter
        cy.get('@inputEl').type('{downarrow}{downarrow}{downarrow}{uparrow}');
        cy.get('@ariaEl').get('#aria-context').should('contain', 'option English focused');
        cy.get('@inputEl').type('{enter}');
        cy.get('#displayLanguage').should('contain', 'English');
        cy.get('@ariaEl').get('#aria-selection-event').should('contain', 'option English, selected');
    });

    it('MM-T1488 Profile Picture should read labels', () => {
        // # Go to Edit Profile picture
        cy.get('#generalButton').click();
        cy.get('#pictureEdit').click();

        // * Verify image alt in profile image
        cy.get('.profile-img').should('have.attr', 'alt', 'profile image');

        cy.get('#generalSettings').then((el) => {
            if (el.find('.profile-img__remove').length > 0) {
                cy.findByTestId('removeSettingPicture').click();
                cy.findByTestId('saveSettingPicture').click();
                cy.get('#pictureEdit').click();
            }
        });

        // * Check Labels in different buttons
        cy.findByTestId('inputSettingPictureButton').should('have.attr', 'aria-label', 'Select');
        cy.findByTestId('saveSettingPicture').should('have.attr', 'aria-label', 'Save').and('have.attr', 'disabled');
        cy.findByTestId('cancelSettingPicture').should('have.attr', 'aria-label', 'Cancel');

        // # Upload a pic and save
        cy.findByTestId('uploadPicture').attachFile('mattermost-icon.png');
        cy.findByTestId('saveSettingPicture').should('not.be.disabled').click();

        // # Click on Edit Profile Picture
        cy.get('#pictureEdit').click();

        // * Verify image alt in profile image
        cy.get('.profile-img').should('have.attr', 'alt', 'profile image');

        // # Option to Remove Profile picture should be present
        cy.findByTestId('removeSettingPicture').within(() => {
            cy.get('.sr-only').should('have.text', 'Remove Profile Picture');
        });

        // # Check tab behavior
        cy.findByTestId('removeSettingPicture').focus().tab({shift: true}).tab();
        cy.findByTestId('removeSettingPicture').should('have.class', 'a11y--active a11y--focused').tab();
        cy.findByTestId('inputSettingPictureButton').should('have.class', 'a11y--active a11y--focused').tab();
        cy.findByTestId('cancelSettingPicture').should('have.class', 'a11y--active a11y--focused');

        // # Remove the profile picture and check the tab behavior
        cy.findByTestId('removeSettingPicture').click().wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('inputSettingPictureButton').focus().tab({shift: true}).tab();
        cy.findByTestId('inputSettingPictureButton').should('have.class', 'a11y--active a11y--focused').tab();
        cy.findByTestId('saveSettingPicture').should('have.class', 'a11y--active a11y--focused').tab();
        cy.findByTestId('cancelSettingPicture').should('have.class', 'a11y--active a11y--focused');
        cy.findByTestId('saveSettingPicture').click();
    });

    it('MM-T1496 Security Settings screen should read labels', () => {
        // # Go to Security Settings
        cy.get('#securityButton').click();

        // * Check Tab behavior in MFA section
        cy.get('#mfaEdit').click();
        cy.get('#passwordEdit').focus().tab({shift: true}).tab().tab();
        cy.get('.setting-list a.btn').should('have.class', 'a11y--active a11y--focused').tab();
        cy.get('#cancelSetting').should('have.class', 'a11y--active a11y--focused');

        // * Check Tab behavior in Sign-In Method if its available
        cy.get('.user-settings').then((el) => {
            if (el.find('#signinEdit').length) {
                cy.get('#signinEdit').click();
                cy.get('#mfaEdit').focus().tab({shift: true}).tab().tab();
                cy.get('.setting-list a.btn').should('have.class', 'a11y--active a11y--focused').tab();
                cy.get('#cancelSetting').should('have.class', 'a11y--active a11y--focused');
            }
        });
    });
});
