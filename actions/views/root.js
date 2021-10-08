// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import * as UserActions from 'mattermost-redux/actions/users';
import {getSubscriptionStats} from 'mattermost-redux/actions/cloud';
import {Client4} from 'mattermost-redux/client';

import {ActionTypes} from 'utils/constants';
import en from 'i18n/en.json';
import {getCurrentLocale, getTranslations} from 'selectors/i18n';

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

        // load the cloud subscription stats
        const isCloud = resolvedPromises[1]?.data?.Cloud === 'true';
        if (isCloud) {
            resolvedPromises.push(await dispatch(getSubscriptionStats()));
        }

        return resolvedPromises;
    };
}

const pluginTranslationSources = {};

export function registerPluginTranslationsSource(pluginId, sourceFunction) {
    pluginTranslationSources[pluginId] = sourceFunction;
    return (dispatch, getState) => {
        const state = getState();
        const locale = getCurrentLocale(state);
        const immutableTranslations = getTranslations(state, locale);
        const translations = {};
        Object.assign(translations, immutableTranslations);
        if (immutableTranslations) {
            Object.assign(translations, sourceFunction(locale));
            dispatch({
                type: ActionTypes.RECEIVED_TRANSLATIONS,
                data: {
                    locale,
                    translations,
                },
            });
        }
    };
}

export function unregisterPluginTranslationsSource(pluginId) {
    Reflect.deleteProperty(pluginTranslationSources, pluginId);
}

export function loadTranslations(locale, url) {
    return async (dispatch) => {
        const translations = {...en};
        Object.values(pluginTranslationSources).forEach((pluginFunc) => {
            Object.assign(translations, pluginFunc(locale));
        });

        // Need to go to the server for languages other than English
        if (locale !== 'en') {
            try {
                const serverTranslations = await Client4.getTranslations(url);
                Object.assign(translations, serverTranslations);
            } catch (error) {
                console.error(error); //eslint-disable-line no-console
            }
        }
        dispatch({
            type: ActionTypes.RECEIVED_TRANSLATIONS,
            data: {
                locale,
                translations,
            },
        });
    };
}

