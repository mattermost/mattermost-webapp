// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import * as UserActions from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import {ActionTypes} from 'utils/constants';
import en from 'i18n/en.json';

export function loadMeAndConfig() {
    return async (dispatch) => {
        // if any new promise needs to be added please be mindful of the order as it is used in root.jsx for redirection
        const promises = [
            dispatch(getClientConfig()),
            dispatch(getLicenseConfig()),
        ];

        // need to await for clientConfig first as it is required for loadMe
        const resolvedPromises = await Promise.all(promises);
        if (document.cookie.indexOf('MMUSERID=') > -1) {
            resolvedPromises.push(await dispatch(UserActions.loadMe()));
        }

        return resolvedPromises;
    };
}

const pluginTranslationSources = {};

export function registerPluginTranslationsSource(pluginId, sourceFunction) {
    pluginTranslationSources[pluginId] = sourceFunction;
}

export function unregisterPluginTranslationsSource(pluginId) {
    Reflect.deleteProperty(pluginTranslationSources, pluginId);
}

export function loadTranslations(locale, url) {
    return (dispatch) => {
        const translations = {};
        Object.values(pluginTranslationSources).forEach((pluginFunc) => {
            Object.assign(translations, pluginFunc(locale));
        });

        // No need to go to the server for EN
        if (locale === 'en') {
            Object.assign(translations, en);
            dispatch({
                type: ActionTypes.RECEIVED_TRANSLATIONS,
                data: {
                    locale,
                    translations,
                },
            });
            return;
        }
        Client4.getTranslations(url).then((serverTranslations) => {
            Object.assign(translations, serverTranslations);
            dispatch({
                type: ActionTypes.RECEIVED_TRANSLATIONS,
                data: {
                    locale,
                    translations,
                },
            });
        }).catch(() => {}); // eslint-disable-line no-empty-function
    };
}

export function clearUserCookie() {
    // We need to clear the cookie without the domain, with the domain, and with both the domain and path set because we
    // can't tell if the server set the cookie with or without the domain.
    // The server will have set the domain if ServiceSettings.EnableCookiesForSubdomains is true
    // The server will have set a non-default path if Mattermost is also served from a subpath.
    document.cookie = 'MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    document.cookie = `MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=${window.basename}`;
    document.cookie = `MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${window.location.hostname};path=/`;
    document.cookie = `MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${window.location.hostname};path=${window.basename}`;
    document.cookie = 'MMCSRF=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    document.cookie = `MMCSRF=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=${window.basename}`;
    document.cookie = `MMCSRF=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${window.location.hostname};path=/`;
    document.cookie = `MMCSRF=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${window.location.hostname};path=${window.basename}`;
}
