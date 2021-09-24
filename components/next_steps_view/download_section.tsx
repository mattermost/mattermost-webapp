// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {isDesktopApp, isWindows, isMac} from 'utils/user_agent';
import {isMobile} from 'utils/utils';
import {trackEvent} from 'actions/telemetry_actions';

import Card from 'components/card/card';

import DownloadApps from './images/download-apps.svg';
import {getAnalyticsCategory} from './step_helpers';

type Props = {
    isFirstAdmin: boolean;
    withinNextStep?: boolean;
}

function DownloadSection(props: Props): JSX.Element | null {
    if (isMobile()) {
        return (
            <div className='NextStepsView__tipsMobileMessage'>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <i className='icon icon-laptop'/>
                        <FormattedMessage
                            id='next_steps_view.mobile_tips_message'
                            defaultMessage='To configure your workspace, continue on a desktop computer.'
                        />
                    </div>
                </Card>
            </div>
        );
    } else if (!isDesktopApp()) {
        return (
            <div
                className={classNames('NextStepsView__download', {
                    'NextStepsView__download--next-step': props.withinNextStep,
                })}
            >
                <DownloadApps/>
                <div className='NextStepsView__downloadText'>
                    <h4>
                        <FormattedMessage
                            id='next_steps_view.downloadDesktopAndMobile'
                            defaultMessage='Download the Desktop and Mobile apps'
                        />
                    </h4>
                    <div className='NextStepsView__downloadButtons'>
                        <button
                            className='NextStepsView__button NextStepsView__downloadForPlatformButton secondary'
                            onClick={() => downloadLatest(props.isFirstAdmin)}
                        >
                            {getDownloadButtonString()}
                        </button>
                        <button
                            className='NextStepsView__button NextStepsView__downloadAnyButton tertiary'
                            onClick={() => seeAllApps(props.isFirstAdmin)}
                        >
                            <FormattedMessage
                                id='next_steps_view.seeAllTheApps'
                                defaultMessage='See all the apps'
                            />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

const getDownloadButtonString = () => {
    if (isWindows()) {
        return (
            <FormattedMessage
                id='next_steps_view.tips.getForWindows'
                defaultMessage='Get Mattermost for Windows'
            />
        );
    }

    if (isMac()) {
        return (
            <FormattedMessage
                id='next_steps_view.tips.getForMac'
                defaultMessage='Get Mattermost for Mac'
            />
        );
    }

    // TODO: isLinux?

    return (
        <FormattedMessage
            id='next_steps_view.tips.getForDefault'
            defaultMessage='Get Mattermost'
        />
    );
};

const seeAllApps = (isAdmin: boolean) => {
    trackEvent(getAnalyticsCategory(isAdmin), 'cloud_see_all_apps');
    window.open('https://mattermost.com/download/#mattermostApps', '_blank');
};

const downloadLatest = (isAdmin: boolean) => {
    const baseLatestURL = 'https://latest.mattermost.com/mattermost-desktop-';

    if (isWindows()) {
        trackEvent(getAnalyticsCategory(isAdmin), 'click_download_app', {app: 'windows'});
        window.open(`${baseLatestURL}exe`, '_blank');
        return;
    }

    if (isMac()) {
        trackEvent(getAnalyticsCategory(isAdmin), 'click_download_app', {app: 'mac'});
        window.open(`${baseLatestURL}dmg`, '_blank');
        return;
    }

    // TODO: isLinux?

    seeAllApps(isAdmin);
};

export default DownloadSection;

