// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ErrorPageTypes} from 'utils/constants.jsx';

import ErrorLink from './error_link.jsx';

export default function ErrorMessage({type, message, service}) {
    let errorMessage = null;
    if (type) {
        switch (type) {
        case ErrorPageTypes.LOCAL_STORAGE:
            errorMessage = (
                <div>
                    <FormattedMessage
                        id='error.local_storage.message'
                        defaultMessage='Mattermost was unable to load because a setting in your browser prevents the use of its local storage features. To allow Mattermost to load, try the following actions:'
                    />
                    <ul>
                        <li>
                            <FormattedMessage
                                id='error.local_storage.help1'
                                defaultMessage='Enable cookies'
                            />
                        </li>
                        <li>
                            <FormattedMessage
                                id='error.local_storage.help2'
                                defaultMessage='Turn off private browsing'
                            />
                        </li>
                        <li>
                            <FormattedMessage
                                id='error.local_storage.help3'
                                defaultMessage='Use a supported browser (IE 11, Chrome 43+, Firefox 38+, Safari 9, Edge)'
                            />
                        </li>
                    </ul>
                </div>
            );
            break;
        case ErrorPageTypes.PERMALINK_NOT_FOUND:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='permalink.error.access'
                        defaultMessage='Permalink belongs to a deleted message or to a channel to which you do not have access.'
                    />
                </p>
            );
            break;
        case ErrorPageTypes.OAUTH_MISSING_CODE:
            errorMessage = (
                <div>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code'
                            defaultMessage='The service provider {service} did not provide an authorization code in the redirect URL.'
                            values={{
                                service,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.google'
                            defaultMessage='For {link} make sure your administrator enabled the Google+ API.'
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://docs.mattermost.com/deployment/sso-google.html'}
                                        messageId={'error.oauth_missing_code.google.link'}
                                        defaultMessage={'Google Apps'}
                                    />
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.office365'
                            defaultMessage='For {link} make sure the administrator of your Microsoft organization has enabled the Mattermost app.'
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://docs.mattermost.com/deployment/sso-office.html'}
                                        messageId={'error.oauth_missing_code.office365.link'}
                                        defaultMessage={'Office 365'}
                                    />
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.gitlab'
                            defaultMessage='For {link} please make sure you followed the setup instructions.'
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://docs.mattermost.com/deployment/sso-gitlab.html'}
                                        messageId={'error.oauth_missing_code.gitlab.link'}
                                        defaultMessage={'GitLab'}
                                    />
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.forum'
                            defaultMessage="If you reviewed the above and are still having trouble with configuration, you may post in our {link} where we'll be happy to help with issues during setup."
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://forum.mattermost.org/c/trouble-shoot'}
                                        messageId={'error.oauth_missing_code.forum.link'}
                                        defaultMessage={'Troubleshooting forum'}
                                    />
                                ),
                            }}
                        />
                    </p>
                </div>
            );
            break;
        case ErrorPageTypes.PAGE_NOT_FOUND:
        default:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.not_found.message'
                        defaultMessage='The page you were trying to reach does not exist'
                    />
                </p>
            );
        }
    } else if (message) {
        errorMessage = (
            <p>
                {message}
            </p>
        );
    } else {
        errorMessage = (
            <p>
                <FormattedMessage
                    id='error.generic.message'
                    defaultMessage='An error has occurred.'
                />
            </p>
        );
    }

    return errorMessage;
}

ErrorMessage.propTypes = {

    /*
    * Error type
    */
    type: PropTypes.string,

    /*
    * Error message
    */
    message: PropTypes.string,

    /*
    * Service provider
    */
    service: PropTypes.string,
};
