// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***********************************************************
// Read more at: https://on.cypress.io/configuration
// ***********************************************************

/* eslint-disable no-loop-func, quote-props */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import 'cypress-wait-until';
import 'cypress-plugin-tab';
import addContext from 'mochawesome/addContext';

import './api';
import './api_commands'; // soon to deprecate
import './common_login_commands';
import './db_commands';
import './fetch_commands';
import './ldap_commands';
import './okta_commands';
import './saml_commands';
import './storybook_commands';
import './task_commands';
import './ui';
import './ui_commands'; // soon to deprecate
import './visual_commands';

import {getAdminAccount} from './env';

const percentEncoding = {
    ':': '%3A',
    '/': '%2F',
    '?': '%3F',
    '#': '%23',
    '[': '%5B',
    ']': '%5D',
    '@': '%40',
    '!': '%21',
    '$': '%24',
    '&': '%26',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A',
    '+': '%2B',
    ',': '%2C',
    ';': '%3B',
    '=': '%3D',
    '%': '%25',
    ' ': '+',
};

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

        const filename = `${parentNames}${testTitle}${hookName} (failed).png`.split('').map((w) => percentEncoding[w] || w).join('');

        // Add context to the mochawesome report which includes the screenshot
        addContext({test}, {
            title: 'Failing Screenshot: >> screenshots/' + Cypress.spec.name + '/' + filename,
            value: 'screenshots/' + Cypress.spec.name + '/' + filename,
        });
    }
});

before(() => {
    const admin = getAdminAccount();

    cy.dbGetUser({username: admin.username}).then(({user}) => {
        if (user.id) {
            // # Login existing sysadmin
            cy.apiAdminLogin();
        } else {
            // # Create and login a newly created user as sysadmin
            cy.apiCreateAdmin().then(({sysadmin}) => {
                cy.apiAdminLogin().then(() => {
                    cy.apiSaveTutorialStep(sysadmin.id, '999');
                });
            });
        }

        // # Reset config and invalidate cache
        cy.apiUpdateConfig();
        cy.apiInvalidateCache();

        // # Reset admin preference, online status and locale
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.apiSaveLinkPreviewsPreference('true');
        cy.apiSaveCollapsePreviewsPreference('false');
        cy.apiUpdateUserStatus('online');
        cy.apiPatchMe({
            locale: 'en',
            timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
        });

        // # Reset roles
        cy.apiGetClientLicense().then((res) => {
            if (res.body.IsLicensed === 'true') {
                cy.apiResetRoles();
            }
        });

        // # Check if default team is present; create if not found.
        cy.apiGetTeams().then((teamsRes) => {
            // Default team is meant for sysadmin's primary team,
            // selected for compatibility with existing local development.
            // It is not exported since it should not be used for testing.
            const DEFAULT_TEAM = {name: 'ad-1', display_name: 'eligendi', type: 'O'};

            const teams = teamsRes.body;
            const defaultTeam = teams && teams.length > 0 && teams.find((team) => team.name === DEFAULT_TEAM.name);

            if (!defaultTeam) {
                cy.apiCreateTeam(DEFAULT_TEAM.name, DEFAULT_TEAM.display_name, 'O', false);
            } else if (defaultTeam && Cypress.env('resetBeforeTest')) {
                teams.forEach((team) => {
                    if (team.name !== DEFAULT_TEAM.name) {
                        cy.apiDeleteTeam(team.id);
                    }
                });

                cy.apiGetChannelsForUser('me', defaultTeam.id).then((channelsRes) => {
                    const channels = channelsRes.body;

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
    });
});

// Add login cookies to whitelist to preserve it
beforeEach(() => {
    Cypress.Cookies.preserveOnce('MMAUTHTOKEN', 'MMUSERID', 'MMCSRF');
});
