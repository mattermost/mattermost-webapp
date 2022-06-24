// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***********************************************************
// Read more at: https://on.cypress.io/configuration
// ***********************************************************

/* eslint-disable no-loop-func */

import dayjs from 'dayjs';
import localforage from 'localforage';

import type {Suite, Context} from 'mocha';

import {ClientConfig} from '@mattermost/types/config';
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
import './email';
import './external_commands';
import './extended_commands';
import './fetch_commands';
import './keycloak_commands';
import './ldap_commands';
import './ldap_server_commands';
import './okta_commands';
import './saml_commands';
import './shell';
import './task_commands';
import './ui';
import './ui_commands'; // soon to deprecate

import {DEFAULT_TEAM} from './constants';

import {getDefaultConfig} from './api/system';

Cypress.dayjs = dayjs;
type IdSuite = Suite & {id: string}

Cypress.on('test:after:run', (test, runnable) => {
    // Only if the test is failed do we want to add
    // the additional context of the screenshot.
    if (test.state === 'failed') {
        let parentNames = '';

        // Define our starting parent
        let parent: Suite = runnable.parent;

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
            if ((parent as IdSuite).id !== `r${hookId}`) {
                while (parent.parent && (parent.parent as IdSuite).id !== `r${hookId}`) {
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
        addContext({test: test as any} as Context, {
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
    // # Clear localforage state
    localforage.clear();

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
        cy.log(`Build Number: ${(config as unknown as ClientConfig).BuildNumber} | Version: ${(config as unknown as ClientConfig).Version} | Hash: ${(config as unknown as ClientConfig).BuildHash}`);
    });
}

function sysadminSetup(user: {username: string; password: string; email_verified: boolean; id: string}) {
    if (Cypress.env('firstTest')) {
        // Sends dummy call to update the config to server
        // Without this, first call to `cy.apiUpdateConfig()` consistently getting time out error in CI against remote server.
        cy.externalRequest({user, method: 'put', path: 'config', data: getDefaultConfig(), failOnStatusCode: false});
    }

    if (!user.email_verified) {
        cy.apiVerifyUserEmailById(user.id);
    }

    // # Reset config to default
    cy.apiUpdateConfig();

    // # Reset admin preference, online status and locale
    resetUserPreference(user.id);
    cy.apiUpdateUserStatus('online');
    cy.apiPatchMe({
        locale: 'en',
        timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
    });

    // # Reset roles
    cy.apiGetClientLicense().then(({isLicensed}) => {
        if (isLicensed) {
            cy.apiResetRoles();
        }
    });

    // # Disable plugins not included in prepackaged
    cy.apiDisableNonPrepackagedPlugins();

    // # Check if default team is present; create if not found.
    cy.apiGetTeamsForUser().then(({teams}) => {
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
                        (channel.team_id === defaultTeam.id || (channel as any).team_name === defaultTeam.name) &&
                        (channel.name !== 'town-square' && channel.name !== 'off-topic')
                    ) {
                        cy.apiDeleteChannel(channel.id);
                    }
                });
            });
        }
    });
}

function resetUserPreference(userId: string) {
    cy.apiSaveTeammateNameDisplayPreference('username');
    cy.apiSaveLinkPreviewsPreference('true');
    cy.apiSaveCollapsePreviewsPreference('false');
    cy.apiSaveClockDisplayModeTo24HourPreference(false);
    cy.apiSaveTutorialStep(userId, '999');
    cy.apiSaveOnboardingTaskListPreference(userId, 'onboarding_task_list_open', 'false');
    cy.apiSaveOnboardingTaskListPreference(userId, 'onboarding_task_list_show', 'false');
    cy.apiSaveCloudTrialBannerPreference(userId, 'trial', 'max_days_banner');
    cy.apiSaveActionsMenuPreference(userId);
    cy.apiSaveSkipStepsPreference(userId, 'true');
    cy.apiSaveStartTrialModal(userId, 'true');
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        type AdminConfig = import('@mattermost/types/config').AdminConfig;
        type AnalyticsRow = import('mattermost-redux/types/admin').AnalyticsRow;
        type Bot = import('@mattermost/types/bots').Bot;
        type BotPatch = import('@mattermost/types/bots').BotPatch;
        type Channel = import('@mattermost/types/channels').Channel;
        type Client = import('./client-impl').E2EClient;
        type ClientLicense = import('@mattermost/types/config').ClientLicense;
        type ChannelMembership = import('@mattermost/types/channels').ChannelMembership;
        type ChannelType = import('@mattermost/types/channels').ChannelType;
        type IncomingWebhook = import('@mattermost/types/integrations').IncomingWebhook;
        type OutgoingWebhook = import('@mattermost/types/integrations').OutgoingWebhook;
        type Permissions = string[];
        type PluginManifest = import('@mattermost/types/plugins').PluginManifest;
        type PluginsResponse = import('@mattermost/types/plugins').PluginsResponse;
        type PreferenceType = import('@mattermost/types/preferences').PreferenceType;
        type Product = import('@mattermost/types/cloud').Product;
        type Role = import('@mattermost/types/roles').Role;
        type Scheme = import('@mattermost/types/schemes').Scheme;
        type Session = import('@mattermost/types/sessions').Session;
        type Subscription = import('@mattermost/types/cloud').Subscription;
        type Team = import('@mattermost/types/teams').Team;
        type TeamMembership = import('@mattermost/types/teams').TeamMembership;
        type TermsOfService = import('@mattermost/types/terms_of_service').TermsOfService;
        type UserProfile = import('@mattermost/types/users').UserProfile;
        type UserStatus = import('@mattermost/types/users').UserStatus;
        type UserCustomStatus = import('@mattermost/types/users').UserCustomStatus;
        type UserAccessToken = import('@mattermost/types/users').UserAccessToken;

        interface Cypress {
            dayjs: typeof dayjs;
        }
    }
}
