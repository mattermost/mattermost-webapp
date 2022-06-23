// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PreferenceType} from '@mattermost/types/preferences';

import theme from '../../fixtures/theme.json';
import {ResponseT} from './types';

// *****************************************************************************
// Preferences
// https://api.mattermost.com/#tag/preferences
// *****************************************************************************

function apiSaveUserPreference(preferences: PreferenceType[] = [], userId = 'me'): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/preferences`,
        method: 'PUT',
        body: preferences,
    });
}
Cypress.Commands.add('apiSaveUserPreference', apiSaveUserPreference);

function apiSaveClockDisplayModeTo24HourPreference(is24Hour = true): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'use_military_time',
            value: is24Hour.toString(),
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveClockDisplayModeTo24HourPreference', apiSaveClockDisplayModeTo24HourPreference);

function apiSaveChannelDisplayModePreference(value = 'full'): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'channel_display_mode',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveChannelDisplayModePreference', apiSaveChannelDisplayModePreference);

/**
 * Saves message display preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} value - Either "clean" (default) or "compact"
 */
Cypress.Commands.add('apiSaveMessageDisplayPreference', (value = 'clean') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'message_display',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
});

function apiSaveShowMarkdownPreviewPreference(value = 'true'): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'advanced_settings',
            name: 'feature_enabled_markdown_preview',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveShowMarkdownPreviewPreference',apiSaveShowMarkdownPreviewPreference);

function apiSaveTeammateNameDisplayPreference(value = 'username'): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'name_format',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveTeammateNameDisplayPreference', apiSaveTeammateNameDisplayPreference);

function apiSaveThemePreference(value = JSON.stringify(theme.default)): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'theme',
            name: '',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveThemePreference', apiSaveThemePreference);

const defaultSidebarSettingPreference = {
    grouping: 'by_type',
    unreads_at_top: 'true',
    favorite_at_top: 'true',
    sorting: 'alpha',
};

function apiSaveSidebarSettingPreference(value = {}): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const newValue = {
            ...defaultSidebarSettingPreference,
            ...value,
        };

        const preference = {
            user_id: cookie.value,
            category: 'sidebar_settings',
            name: '',
            value: JSON.stringify(newValue),
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveSidebarSettingPreference', apiSaveSidebarSettingPreference);

function apiSaveLinkPreviewsPreference(show = 'true'): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'link_previews',
            value: show,
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveLinkPreviewsPreference', apiSaveLinkPreviewsPreference);


function apiSaveCollapsePreviewsPreference(collapse = 'true'): ReturnType<typeof apiSaveUserPreference> {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'collapse_previews',
            value: collapse,
        };

        return cy.apiSaveUserPreference([preference]);
    });
}
Cypress.Commands.add('apiSaveCollapsePreviewsPreference', apiSaveCollapsePreviewsPreference);

function apiSaveTutorialStep(userId: string, value = '999'): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'tutorial_step',
        name: userId,
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveTutorialStep', apiSaveTutorialStep);

function apiSaveDirectChannelShowPreference(userId: string, otherUserId: string, value: string): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'direct_channel_show',
        name: otherUserId,
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveDirectChannelShowPreference', apiSaveDirectChannelShowPreference);

function apiGetUserPreference(userId: string): ResponseT<any> {
    // compiler treating this as a Chainable<JQuery<any>>
    // @ts-ignore
    return cy.request(`/api/v4/users/${userId}/preferences`).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response.body);
    });
}
Cypress.Commands.add('apiGetUserPreference', apiGetUserPreference);

function apiSaveCRTPreference(userId: string, value = 'on'): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'display_settings',
        name: 'collapsed_reply_threads',
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveCRTPreference', apiSaveCRTPreference);

function apiSaveCloudTrialBannerPreference(userId: string, name: string, value: string): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'cloud_trial_banner',
        name,
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveCloudTrialBannerPreference', apiSaveCloudTrialBannerPreference);

function apiSaveActionsMenuPreference(userId: string, value = true): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'actions_menu',
        name: 'actions_menu_tutorial_state',
        value: JSON.stringify({actions_menu_modal_viewed: value}),
    };

    return cy.apiSaveUserPreference([preference], userId);
};
Cypress.Commands.add('apiSaveActionsMenuPreference', apiSaveActionsMenuPreference);

function apiSaveStartTrialModal(userId: string, value = 'true'): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'start_trial_modal',
        name: 'trial_modal_auto_shown',
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveStartTrialModal', apiSaveStartTrialModal);

function apiSaveOnboardingTaskListPreference(userId: string, name: string, value: string): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'onboarding_task_list',
        name,
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveOnboardingTaskListPreference', apiSaveOnboardingTaskListPreference);

function apiSaveSkipStepsPreference(userId: string, value: 'true' | 'false'): ReturnType<typeof apiSaveUserPreference> {
    const preference = {
        user_id: userId,
        category: 'recommended_next_steps',
        name: 'skip',
        value,
    };

    return cy.apiSaveUserPreference([preference], userId);
}
Cypress.Commands.add('apiSaveSkipStepsPreference', apiSaveSkipStepsPreference);

declare global {
    namespace Cypress {
        interface Chainable {

            // *******************************************************************************
            // Preferences
            // https://api.mattermost.com/#tag/preferences
            // *******************************************************************************

            /**
             * Save a list of the user's preferences.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {PreferenceType[]} preferences - List of preference objects
             * @param {string} userId - User ID
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveUserPreference([{user_id: 'user-id', category: 'display_settings', name: 'channel_display_mode', value: 'full'}], 'user-id');
             */
            apiSaveUserPreference: typeof apiSaveUserPreference;

            /**
             * Skip the recommended_next_steps for the user.
             * @param {string} userId - User ID
             * @param {string} value - 'true' or 'false'
             * @example
             *   cy.apiSaveSkipStepsPreference('user-id', 'true');
             */
            apiSaveSkipStepsPreference: typeof apiSaveSkipStepsPreference;

            /**
             * Saves tutorial step of a user
             * This API assume that the user is logged in and has cookie to access
             * @param {string} value - value of tutorial step, e.g. '999' (default, completed tutorial)
             */
            apiSaveTutorialStep: typeof apiSaveTutorialStep;

            /**
             * Get the full list of the user's preferences.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/get
             * @param {string} userId - User ID
             * @returns {Response} response: Cypress-chainable response which should have a list of preference objects
             *
             * @example
             *   cy.apiGetUserPreference('user-id');
             */
            apiGetUserPreference: typeof apiGetUserPreference;

            /**
             * Save clock display mode to 24-hour preference.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {boolean} is24Hour - true (default) or false for 12-hour
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveClockDisplayModeTo24HourPreference(true);
             */
            apiSaveClockDisplayModeTo24HourPreference: typeof apiSaveClockDisplayModeTo24HourPreference;

            /**
             * Save onboarding tasklist preference.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {string} userId - User ID
             * @param {string} name - options are complete_profile, team_setup, invite_members or hide
             * @param {string} value - options are 'true' or 'false'
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveOnboardingTaskListPreference('user-id', 'hide', 'true');
             */
            apiSaveOnboardingTaskListPreference: typeof apiSaveOnboardingTaskListPreference

            /**
             * Save DM channel show preference.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {string} userId - User ID
             * @param {string} otherUserId - Other user in a DM channel
             * @param {string} value - options are 'true' or 'false'
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveDirectChannelShowPreference('user-id', 'other-user-id', 'false');
             */
            apiSaveDirectChannelShowPreference: typeof apiSaveDirectChannelShowPreference;

            /**
             * Save Collapsed Reply Threads preference.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {string} userId - User ID
             * @param {string} value - options are 'on' or 'off'
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveCRTPreference('user-id', 'on');
             */
            apiSaveCRTPreference: typeof apiSaveCRTPreference;

            /**
             * Save cloud trial banner preference.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {string} userId - User ID
             * @param {string} name - options are trial or hide
             * @param {string} value - options are 'max_days_banner' or '3_days_banner' for trial, and 'true' or 'false' for hide
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveCloudTrialBannerPreference('user-id', 'hide', 'true');
             */
            apiSaveCloudTrialBannerPreference: typeof apiSaveCloudTrialBannerPreference

            /**
             * Save actions menu preference.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {string} userId - User ID
             * @param {string} value - true (default) or false
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveActionsMenuPreference('user-id', true);
             */
            apiSaveActionsMenuPreference: typeof apiSaveActionsMenuPreference;

            /**
             * Save show trial modal.
             * See https://api.mattermost.com/#tag/preferences/paths/~1users~1{user_id}~1preferences/put
             * @param {string} userId - User ID
             * @param {string} name - trial_modal_auto_shown
             * @param {string} value - values are 'true' or 'false'
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiSaveStartTrialModal('user-id', 'true');
             */
            apiSaveStartTrialModal: typeof apiSaveStartTrialModal;

            /**
             * Saves channel display mode preference of a user directly via API
             * This API assume that the user is logged in and has cookie to access
             * @param {String} value - Either "full" (default) or "centered"
             */
            apiSaveChannelDisplayModePreference: typeof apiSaveChannelDisplayModePreference;

            /**
             * Saves show markdown preview option preference of a user directly via API
             * This API assume that the user is logged in and has cookie to access
             * @param {String} value - Either "true" to show the options (default) or "false"
             */
            apiSaveShowMarkdownPreviewPreference: typeof apiSaveShowMarkdownPreviewPreference;

            /**
             * Saves teammate name display preference of a user directly via API
             * This API assume that the user is logged in and has cookie to access
             * @param {String} value - Either "username" (default), "nickname_full_name" or "full_name"
             */
            apiSaveTeammateNameDisplayPreference: typeof apiSaveTeammateNameDisplayPreference;

            /**
             * Saves theme preference of a user directly via API
             * This API assume that the user is logged in and has cookie to access
             * @param {Object} value - theme object.  Will pass default value if none is provided.
             */
            apiSaveThemePreference: typeof apiSaveThemePreference;

            /**
             * Saves theme preference of a user directly via API
             * This API assume that the user is logged in and has cookie to access
             * @param {Object} value - sidebar settings object.  Will pass default value if none is provided.
             */
            apiSaveSidebarSettingPreference: typeof apiSaveSidebarSettingPreference

            /**
             * Saves the preference on whether to show link and image previews
             * This API assume that the user is logged in and has cookie to access
             * @param {boolean} show - Either "true" to show link and images previews (default), or "false"
             */
            apiSaveLinkPreviewsPreference: typeof apiSaveLinkPreviewsPreference;

            /**
             * Saves the preference on whether to show link and image previews expanded
             * This API assume that the user is logged in and has cookie to access
             * @param {boolean} collapse - Either "true" to show previews collapsed (default), or "false"
             */
            apiSaveCollapsePreviewsPreference: typeof apiSaveCollapsePreviewsPreference;
        }
    }
}
