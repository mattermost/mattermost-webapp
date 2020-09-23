// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import './cloud_announcement_bar.scss';
import {UserProfile} from 'mattermost-redux/types/users';

import classNames from 'classnames';
import {isEmpty} from 'lodash';

import {Preferences} from 'utils/constants';

type Props = {
    userLimit: string;
    userIsAdmin: boolean;
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isCloud: boolean;
    analytics: {
        TOTAL_USERS: number,
    };
    actions: {
        closeModal: () => void;
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        getStandardAnalytics: () => void;
    };
};

export default class CloudAnnouncementBar extends React.PureComponent<Props> {
    componentDidMount() {
        if (isEmpty(this.props.analytics)) {
            this.props.actions.getStandardAnalytics();
        }
    }

    handleButtonClick = () => {
        // Do nothing for now
    }

    handleClose = async () => {
        await this.props.actions.savePreferences(this.props.currentUser.id, [{
            category: Preferences.CLOUD_UPGRADE_BANNER,
            user_id: this.props.currentUser.id,
            name: 'hide',
            value: 'true',
        }]);
    }

    shouldShowBanner = () => {
        const {userLimit, analytics, userIsAdmin, isCloud} = this.props;
        if (!isCloud) {
            return false;
        }

        if (!userIsAdmin) {
            return false;
        }

        if (parseInt(userLimit, 10) > analytics.TOTAL_USERS) {
            return false;
        }

        return true;
    }

    render() {
        if (!this.shouldShowBanner() || isEmpty(this.props.analytics)) {
            return null;
        }
        const {userLimit, analytics, preferences} = this.props;

        // If AT user limit, and banner hidden, don't render anything
        if (parseInt(userLimit, 10) === analytics.TOTAL_USERS &&
            preferences.some((pref) => pref.name === 'hide' && pref.value === 'true')) {
            return null;
        }

        let dismissable = true;

        // If the user limit is less than the current number of users, the banner is not dismissable
        if (parseInt(userLimit, 10) < analytics.TOTAL_USERS) {
            dismissable = false;
        }

        let closeButton = null;
        if (dismissable) {
            closeButton = (
                <a
                    onClick={this.handleClose}
                    href='#'
                    className='content__close'
                >
                    {''}
                </a>
            );
        }
        return (
            <div
                className={classNames(
                    'announcement-bar',
                    'cloud',
                    dismissable ? '' : 'not-dismissable',
                )}
            >
                <div className={'content'}>
                    {dismissable ? (
                        <div className={'content__icon'}>{''}</div>
                    ) : (

                        <div className={'content__icon'}>{''}</div>
                    )}
                    <div className={'content__description'}>
                        {"You've reached the user limit of the free tier"}
                    </div>
                    <button
                        onClick={this.handleButtonClick}
                        className='upgrade-button'
                    >
                        {'Upgrade Mattermost Cloud'}
                    </button>
                    {closeButton}
                </div>
            </div>
        );
    }
}
