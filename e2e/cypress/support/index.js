// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***********************************************************
// Read more at: https://on.cypress.io/configuration
// ***********************************************************

/* eslint-disable no-loop-func */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import 'cypress-wait-until';
import 'cypress-plugin-tab';
import addContext from 'mochawesome/addContext';

import './api';
import './api_commands'; // soon to deprecate
import './client';
import './common_login_commands';
import './db_commands';
import './external_commands';
import './extended_commands';
import './fetch_commands';
import './keycloak_commands';
import './ldap_commands';
import './ldap_server_commands';
import './okta_commands';
import './saml_commands';
import './storybook_commands';
import './task_commands';
import './ui';
import './ui_commands'; // soon to deprecate
import './visual_commands';

import {getDefaultConfig} from './api/system';

Cypress.on('test:after:run', (test, runnable) => {
    // Only if the test is failed do we want to add
    // the additional context of the screenshot.
    if (test.state === 'failed') {
        let parentNames = '';

        // Define our starting parent
        let parent = runnable.parent;

        // If the test failed due to a hook, we have to handle
        // getting our starting parent to form the correct filename.
        if (test.failedFromHookId) {
            // Failed from hook Id is always something like 'h2'
            // We just need the trailing number to match with parent id
            const hookId = test.failedFromHookId.split('')[1];

            // If the current parentId does not match our hook id
            // start digging upwards until we get the parent that
            // has the same hook id, or until we get to a tile of ''
            // (which means we are at the top level)
            if (parent.id !== `r${hookId}`) {
                while (parent.parent && parent.parent.id !== `r${hookId}`) {
                    if (parent.title === '') {
                        // If we have a title of '' we have reached the top parent
                        break;
                    } else {
                        parent = parent.parent;
                    }
                }
            }
        }

        // Now we can go from parent to parent to generate the screenshot filename
        while (parent) {
            // Only append parents that have actual content for their titles
            if (parent.title !== '') {
                parentNames = parent.title + ' -- ' + parentNames;
            }

            parent = parent.parent;
        }

        // Clean up strings of characters that Cypress strips out
        const charactersToStrip = /[;:"<>/]/g;
        parentNames = parentNames.replace(charactersToStrip, '');
        const testTitle = test.title.replace(charactersToStrip, '');

        // If the test has a hook name, that means it failed due to a hook
        // and consequently Cypress appends some text to the file name
        const hookName = test.hookName ? ' -- ' + test.hookName + ' hook' : '';

        const filename = encodeURIComponent(`${parentNames}${testTitle}${hookName} (failed).png`);

        // Add context to the mochawesome report which includes the screenshot
        addContext({test}, {
            title: 'Failing Screenshot: >> screenshots/' + Cypress.spec.name + '/' + filename,
            value: 'screenshots/' + Cypress.spec.name + '/' + filename,
        });
    }
});

// Turn off all uncaught exception handling
Cypress.on('uncaught:exception', () => {
    return false;
});

before(() => {
    // # Try to login using existing sysadmin account
    cy.apiAdminLogin({failOnStatusCode: false}).then((response) => {
        if (response.user) {
            sysadminSetup(response.user);
        } else {
            // # Create and login a newly created user as sysadmin
            cy.apiCreateAdmin().then(({sysadmin}) => {
                cy.apiAdminLogin().then(() => sysadminSetup(sysadmin));
            });
        }

        switch (Cypress.env('serverEdition')) {
        case 'Cloud':
            cy.apiRequireLicenseForFeature('Cloud');
            break;
        case 'E20':
            cy.apiRequireLicense();
            break;
        default:
            break;
        }

        // Log license status and server details before test
        printLicenseStatus();
        printServerDetails();
    });
});

// Add login cookies to whitelist to preserve it
beforeEach(() => {
    Cypress.Cookies.preserveOnce('MMAUTHTOKEN', 'MMUSERID', 'MMCSRF');
});

function printLicenseStatus() {
    cy.apiGetClientLicense().then(({isLicensed, license}) => {
        if (isLicensed) {
            cy.log(`Server has license: ${license.SkuName}`);
        } else {
            cy.log('Server is without license.');
        }
    });
}

function printServerDetails() {
    cy.apiGetConfig(true).then(({config}) => {
        cy.log(`Build Number: ${config.BuildNumber} | Version: ${config.Version} | Hash: ${config.BuildHash}`);
    });
}

function sysadminSetup(user) {
    if (Cypress.env('firstTest')) {
        // Sends dummy call to update the config to server
        // Without this, first call to `cy.apiUpdateConfig()` consistently getting time out error in CI against remote server.
        cy.externalRequest({user, method: 'put', path: 'config', data: getDefaultConfig(), failOnStatusCode: false});
    }

    if (!user.email_verified) {
        cy.apiVerifyUserEmailById(user.id);
    }

    // # Reset config and invalidate cache
    cy.apiUpdateConfig();
    cy.apiInvalidateCache();

    // # Reset admin preference, online status and locale
    cy.apiSaveTeammateNameDisplayPreference('username');
    cy.apiSaveLinkPreviewsPreference('true');
    cy.apiSaveCollapsePreviewsPreference('false');
    cy.apiSaveClockDisplayModeTo24HourPreference(false);
    cy.apiSaveTutorialStep(user.id, '999');
    cy.apiSaveCloudOnboardingPreference(user.id, 'hide', 'true');
    cy.apiUpdateUserStatus('online');
    cy.apiPatchMe({
        locale: 'en',
        timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
    });

    // # Reset roles
    cy.apiGetClientLicense().then(({isLicensed, isCloudLicensed}) => {
        if (isLicensed) {
            cy.apiResetRoles();
        }

        if (isCloudLicensed) {
            // # Modify sysadmin role for Cloud edition
            cy.apiPatchUserRoles(user.id, ['system_admin', 'system_manager', 'system_user']);
        }
    });

    // # Check if default team is present; create if not found.
    cy.apiGetTeamsForUser().then(({teams}) => {
        // Default team is meant for sysadmin's primary team,
        // selected for compatibility with existing local development.
        // It is not exported since it should not be used for testing.
        const DEFAULT_TEAM = {name: 'ad-1', display_name: 'eligendi', type: 'O'};

        const defaultTeam = teams && teams.length > 0 && teams.find((team) => team.name === DEFAULT_TEAM.name);

        if (!defaultTeam) {
            cy.apiCreateTeam(DEFAULT_TEAM.name, DEFAULT_TEAM.display_name, 'O', false);
        } else if (defaultTeam && Cypress.env('resetBeforeTest')) {
            teams.forEach((team) => {
                if (team.name !== DEFAULT_TEAM.name) {
                    cy.apiDeleteTeam(team.id);
                }
            });

            cy.apiGetChannelsForUser('me', defaultTeam.id).then(({channels}) => {
                channels.forEach((channel) => {
                    if (
                        (channel.team_id === defaultTeam.id || channel.team_name === defaultTeam.name) &&
                        (channel.name !== 'town-square' && channel.name !== 'off-topic')
                    ) {
                        cy.apiDeleteChannel(channel.id);
                    }
                });
            });
        }
    });
}
