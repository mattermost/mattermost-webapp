// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ErrorPageTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default function ErrorTitle({type, title}) {
    let errorTitle = null;
    if (type) {
        switch (type) {
        case ErrorPageTypes.LOCAL_STORAGE:
            errorTitle = (
                <FormattedMessage
                    id='error.local_storage.title'
                    defaultMessage='Cannot Load Mattermost'
                />
            );
            break;
        case ErrorPageTypes.PERMALINK_NOT_FOUND:
            errorTitle = (
                <FormattedMessage
                    id='permalink.error.title'
                    defaultMessage='Message Not Found'
                />
            );
            break;
        case ErrorPageTypes.OAUTH_ACCESS_DENIED:
            errorTitle = (
                <FormattedMessage
                    id='error.oauth_access_denied.title'
                    defaultMessage='Authorization Error'
                />
            );
            break;
        case ErrorPageTypes.OAUTH_MISSING_CODE:
            errorTitle = (
                <FormattedMessage
                    id='error.oauth_missing_code.title'
                    defaultMessage='Mattermost needs your help'
                />
            );
            break;
        case ErrorPageTypes.TEAM_NOT_FOUND:
            errorTitle = (
                <FormattedMessage
                    id='error.team_not_found.title'
                    defaultMessage='Team Not Found'
                />
            );
            break;
        case ErrorPageTypes.CHANNEL_NOT_FOUND:
            errorTitle = (
                <FormattedMessage
                    id='error.channel_not_found.title'
                    defaultMessage='Channel Not Found'
                />
            );
            break;
        case ErrorPageTypes.PAGE_NOT_FOUND:
        default:
            errorTitle = (
                <FormattedMessage
                    id='error.not_found.title'
                    defaultMessage='Page Not Found'
                />
            );
        }
    } else if (title) {
        errorTitle = title;
    } else {
        errorTitle = Utils.localizeMessage('error.generic.title', 'Error');
    }

    return errorTitle;
}

ErrorTitle.propTypes = {

    /*
    * Error type
    */
    type: PropTypes.string,

    /*
    * Error title
    */
    title: PropTypes.string,
};
