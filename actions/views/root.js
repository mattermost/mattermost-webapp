// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import * as UserActions from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import {ActionTypes} from 'utils/constants';

export function loadMeAndConfig() {
    return async (dispatch) => {
        // need to await for clientConfig first as it is required for loadMe
        const clientConfig = await dispatch(getClientConfig());
        const promises = [
            dispatch(getLicenseConfig()),
        ];

        if (document.cookie.indexOf('MMUSERID=') > -1) {
            promises.push(dispatch(UserActions.loadMe()));
        }

        const resolvedPromises = await Promise.all(promises);

        // if any new promise needs to be added please be mindful of the order as it is used in root.jsx for redirection
        return [clientConfig, ...resolvedPromises];
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
