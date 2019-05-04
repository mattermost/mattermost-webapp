// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {useSafeUrl} from 'utils/url';
import MattermostIcon from 'images/favicon/android-chrome-192x192.png';
import Nexus6Mockup from 'images/nexus-6p-mockup.png';

export default function GetAndroidApp({androidAppDownloadLink, history, location}) {
    const onContinue = (e) => {
        e.preventDefault();

        const redirectTo = (new URLSearchParams(location.search)).get('redirect_to');
        if (redirectTo) {
            history.push(redirectTo);
        } else {
            history.push('/');
        }
    };

    return (
        <div className='get-app get-android-app'>
            <h1 className='get-app__header'>
                <FormattedMessage
                    id='get_app.androidHeader'
                    defaultMessage='Mattermost works best if you switch to our Android app'
                />
            </h1>
            <hr/>
            <div>
                <img
                    alt={'android app icon'}
                    className='get-android-app__icon'
                    src={MattermostIcon}
                />
                <div className='get-android-app__app-info'>
                    <span className='get-android-app__app-name'>
                        <FormattedMessage
                            id='get_app.androidAppName'
                            defaultMessage='Mattermost for Android'
                        />
                    </span>
                    <span className='get-android-app__app-creator'>
                        <FormattedMessage
                            id='get_app.mattermostInc'
                            defaultMessage='Mattermost, Inc'
                        />
                    </span>
                </div>
            </div>
            <a
                className='btn btn-primary get-android-app__app-store-link'
                href={useSafeUrl(androidAppDownloadLink)}
            >
                <FormattedMessage
                    id='get_app.continue'
                    defaultMessage='Continue'
                />
            </a>
            <img
                alt={'get app screenshot'}
                className='get-app__screenshot'
                src={Nexus6Mockup}
            />
            <span className='get-app__continue-with-browser'>
                <FormattedMessage
                    id='get_app.continueWithBrowser'
                    defaultMessage='Or {link}'
                    values={{
                        link: (
                            <a
                                onClick={onContinue}
                                className='get-android-app__continue'
                            >

                                <FormattedMessage
                                    id='get_app.continueWithBrowserLink'
                                    defaultMessage='continue with browser'
                                />
                            </a>
                        ),
                    }}
                />
            </span>
        </div>
    );
}

GetAndroidApp.propTypes = {
    androidAppDownloadLink: PropTypes.string,
};
