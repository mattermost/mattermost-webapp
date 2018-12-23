// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import * as UserActions from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import {ActionTypes} from 'utils/constants';

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

export function loadTranslations(locale, url) {
    return (dispatch) => {
        Client4.getTranslations(url).then((translations) => {
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
    // We need to clear the cookie both with and without the domain set because we can't tell if the server set
    // the cookie with it. At this time, the domain will be set if ServiceSettings.EnableCookiesForSubdomains is true.
    document.cookie = 'MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    document.cookie = `MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${window.location.hostname};path=/`;
}
