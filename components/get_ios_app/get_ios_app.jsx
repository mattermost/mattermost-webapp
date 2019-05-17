// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {useSafeUrl} from 'utils/url';
import AppStoreButton from 'images/app-store-button.png';
import IPhone6Mockup from 'images/iphone-6-mockup.png';

export default function GetIosApp({iosAppDownloadLink, history, location}) {
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
        <div className='get-app get-ios-app'>
            <h1 className='get-app__header'>
                <FormattedMessage
                    id='get_app.iosHeader'
                    defaultMessage='Mattermost works best if you switch to our iPhone app'
                />
            </h1>
            <hr/>
            <a
                className='get-ios-app__app-store-link'
                href={useSafeUrl(iosAppDownloadLink)}
                rel='noopener noreferrer'
            >
                <img
                    alt={'app store button'}
                    src={AppStoreButton}
                />
            </a>
            <img
                alt={'get app screenshot'}
                className='get-app__screenshot'
                src={IPhone6Mockup}
            />
            <h2 className='get-ios-app__already-have-it'>
                <FormattedMessage
                    id='get_app.alreadyHaveIt'
                    defaultMessage='Already have it?'
                />
            </h2>
            <a
                className='btn btn-primary get-ios-app__open-mattermost'
                href='mattermost://'
            >
                <FormattedMessage
                    id='get_app.openMattermost'
                    defaultMessage='Open Mattermost'
                />
            </a>
            <span className='get-app__continue-with-browser'>
                <FormattedMessage
                    id='get_app.continueWithBrowser'
                    defaultMessage='Or {link}'
                    values={{
                        link: (
                            <a
                                onClick={onContinue}
                                className='get-ios-app__continue'
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

GetIosApp.propTypes = {
    iosAppDownloadLink: PropTypes.string,
};
