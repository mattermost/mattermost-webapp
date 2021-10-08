// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility @mfa

import * as TIMEOUTS from '../../fixtures/timeouts';
import {isMac} from '../../utils';

describe('Verify Accessibility Support in different sections in Account Settings Dialog', () => {
    const accountSettings = {
        profile: [
            {key: 'name', label: 'Full Name', type: 'text'},
            {key: 'username', label: 'Username', type: 'text'},
            {key: 'nickname', label: 'Nickname', type: 'text'},
            {key: 'position', label: 'Position', type: 'text'},
            {key: 'email', label: 'Email', type: 'text'},
            {key: 'picture', label: 'Profile Picture', type: 'image'},
        ],
        security: [
            {key: 'password', label: 'Password', type: 'text'},
            {key: 'mfa', label: 'Multi-factor Authentication', type: 'optional'},
            {key: 'signin', label: 'Sign-in Method', type: 'optional'},
        ],
    };

    const settings = {
        notifications: [
            {key: 'desktop', label: 'Desktop Notifications', type: 'radio'},
            {key: 'email', label: 'Email Notifications', type: 'radio'},
            {key: 'push', label: 'Mobile Push Notifications', type: 'radio'},
            {key: 'keys', label: 'Words That Trigger Mentions', type: 'checkbox'},
            {key: 'comments', label: 'Reply notifications', type: 'radio'},
        ],
        display: [
            {key: 'theme', label: 'Theme', type: 'radio'},
            {key: 'clock', label: 'Clock Display', type: 'radio'},
            {key: 'name_format', label: 'Teammate Name Display', type: 'none'},
            {key: 'availabilityStatus', label: 'Show online availability on profile images', type: 'radio'},
            {key: 'timezone', label: 'Timezone', type: 'none'},
            {key: 'collapse', label: 'Default Appearance of Image Previews', type: 'radio'},
            {key: 'message_display', label: 'Message Display', type: 'radio'},
            {key: 'channel_display_mode', label: 'Channel Display', type: 'radio'},
            {key: 'one_click_reactions_enabled', label: 'One-click reactions on messages', type: 'radio'},
            {key: 'languages', label: 'Language', type: 'dropdown'},
        ],
        sidebar: [
            {key: 'showUnreadsCategory', label: 'Group unread channels separately', type: 'multiple'},
            {key: 'limitVisibleGMsDMs', label: 'Number of direct messages to show', type: 'radio'},
        ],
        advanced: [
            {key: 'advancedCtrlSend', label: `Send Messages on ${isMac() ? '⌘+ENTER' : 'CTRL+ENTER'}`, type: 'radio'},
            {key: 'formatting', label: 'Enable Post Formatting', type: 'radio'},
            {key: 'joinLeave', label: 'Enable Join/Leave Messages', type: 'radio'},
            {key: 'advancedPreviewFeatures', label: 'Preview Pre-release Features', type: 'checkbox'},
        ],
    };

    before(() => {
        // # Update Configs
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
            DisplaySettings: {
                ExperimentalTimezone: true,
            },
            SamlSettings: {
                Enable: false,
            },
        });

        // # Login as test user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
            cy.postMessage('hello');
        });
    });

    afterEach(() => {
        // # Close the modal
        cy.uiClose();
    });

    it('MM-T1465_1 Verify Label & Tab behavior in section links', () => {
        // * Verify aria-label and tab support in section of Account settings modal
        cy.uiOpenAccountSettingsModal().then(() => {
            cy.findByRole('button', {name: 'profile'}).focus();
            cy.focused().should('have.attr', 'aria-label', 'profile').tab();
            cy.focused().should('have.attr', 'aria-label', 'security').tab();
            cy.uiClose();
        });

        // * Verify aria-label and tab support in section of Settings modal
        cy.uiOpenSettingsModal().then(() => {
            cy.findByRole('button', {name: 'notifications'}).focus();
            cy.focused().should('have.attr', 'aria-label', 'notifications').tab();
            cy.focused().should('have.attr', 'aria-label', 'display').tab();
            cy.focused().should('have.attr', 'aria-label', 'sidebar').tab();
            cy.focused().should('have.attr', 'aria-label', 'advanced').tab();
        });
    });

    it('MM-T1465_2 Verify Accessibility Support in each section in Account Settings Dialog', () => {
        // # Open account settings modal
        cy.uiOpenAccountSettingsModal();

        // * Verify if the focus goes to the individual fields in Profile section
        cy.findByRole('button', {name: 'profile'}).click();
        cy.findByRole('button', {name: 'security'}).focus();
        cy.focused().should('have.attr', 'aria-label', 'security').tab();
        verifySettings(accountSettings.profile);

        // * Verify if the focus goes to the individual fields in Security section
        cy.findByRole('button', {name: 'security'}).click().focus();
        cy.focused().should('have.attr', 'aria-label', 'security').tab();
        verifySettings(accountSettings.security);
        cy.uiClose();

        // # Open settings modal
        cy.uiOpenSettingsModal();

        // * Verify if the focus goes to the individual fields in Notifications section
        cy.findByRole('button', {name: 'notifications'}).click();
        cy.findByRole('button', {name: 'advanced'}).focus();
        cy.focused().should('have.attr', 'aria-label', 'advanced').tab();
        verifySettings(settings.notifications);

        // // * Verify if the focus goes to the individual fields in Display section
        cy.findByRole('button', {name: 'display'}).click();
        cy.findByRole('button', {name: 'advanced'}).focus();
        cy.focused().should('have.attr', 'aria-label', 'advanced').tab();
        verifySettings(settings.display);

        // // * Verify if the focus goes to the individual fields in Sidebar section
        cy.findByRole('button', {name: 'sidebar'}).click();
        cy.findByRole('button', {name: 'advanced'}).focus();
        cy.focused().should('have.attr', 'aria-label', 'advanced').tab();
        verifySettings(settings.sidebar);

        // // * Verify if the focus goes to the individual fields in Advanced section
        cy.findByRole('button', {name: 'advanced'}).click().focus();
        cy.focused().should('have.attr', 'aria-label', 'advanced').tab();
        verifySettings(settings.advanced);
    });

    it('MM-T1481 Verify Correct Radio button behavior in Account Settings', () => {
        cy.uiOpenSettingsModal();

        cy.get('#notificationsButton').click();
        cy.get('#desktopEdit').click();
        cy.get('#desktopNotificationAllActivity').check().should('be.checked').tab().check();
        cy.get('#desktopNotificationMentions').should('be.checked').tab().check();
        cy.get('#desktopNotificationNever').should('be.checked');
    });

    it('MM-T1482 Input fields in Account Settings should read labels', () => {
        cy.uiOpenAccountSettingsModal();

        accountSettings.profile.forEach((section) => {
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
        cy.uiOpenSettingsModal();

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
            cy.get('#aria-context').should('contain', 'option English (Australia) focused').and('contain', 'Use Up and Down to choose options, press Enter to select the currently focused option, press Escape to exit the menu, press Tab to select the option and exit the menu.');
        });

        // # Check if language setting gets changed after user presses enter
        cy.get('@inputEl').type('{enter}');
        cy.get('#displayLanguage').should('contain', 'English (Australia)');
        cy.get('@ariaEl').get('#aria-selection-event').should('contain', 'option English (Australia), selected');

        // # Press down arrow, then up arrow and press enter
        cy.get('@inputEl').type('{downarrow}{downarrow}{downarrow}{uparrow}');
        cy.get('@ariaEl').get('#aria-context').should('contain', 'option English (US) focused');
        cy.get('@inputEl').type('{enter}');
        cy.get('#displayLanguage').should('contain', 'English (US)');
        cy.get('@ariaEl').get('#aria-selection-event').should('contain', 'option English (US), selected');
    });

    it('MM-T1488 Profile Picture should read labels', () => {
        // # Go to Edit Profile picture
        cy.uiOpenAccountSettingsModal();
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
        cy.uiOpenAccountSettingsModal();
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

function verifySettings(settings) {
    settings.forEach((setting) => {
        cy.focused().should('have.id', `${setting.key}Edit`);
        cy.findByText(setting.label);
        cy.focused().tab();
    });
}
