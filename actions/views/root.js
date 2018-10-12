// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import * as UserActions from 'mattermost-redux/actions/users';

export function loadMeAndConfig() {
    return (dispatch) => {
        const promises = [
            dispatch(getClientConfig()),
            dispatch(getLicenseConfig()),
        ];

        if (document.cookie.indexOf('MMUSERID=') > -1) {
            promises.push(dispatch(UserActions.loadMe()));
        }

        return Promise.all(promises);
    };
}
