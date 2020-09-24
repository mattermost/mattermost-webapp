// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import './cloud_announcement_bar.scss';
import {UserProfile} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';
import {isEmpty} from 'lodash';

import {Preferences, CloudBanners} from 'utils/constants';

type Props = {
    userLimit: number;
    userIsAdmin: boolean;
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isCloud: boolean;
    analytics?: Dictionary<number | AnalyticsRow[]>;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        getStandardAnalytics: () => void;
    };
};

export default class CloudAnnouncementBar extends React.PureComponent<Props> {
    async componentDidMount() {
        if (isEmpty(this.props.analytics)) {
            await this.props.actions.getStandardAnalytics();
        }
        document.body.classList.add('cloud-banner--fixed');
    }

    componentWillUnmount() {
        document.body.classList.remove('cloud-banner--fixed');
    }

    handleButtonClick = () => {
        // Do nothing for now
    }

    handleClose = async () => {
        await this.props.actions.savePreferences(this.props.currentUser.id, [{
            category: Preferences.CLOUD_UPGRADE_BANNER,
            user_id: this.props.currentUser.id,
            name: CloudBanners.HIDE,
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

        if (userLimit > analytics!.TOTAL_USERS) {
            return false;
        }

        return true;
    }

    removeFixedBannerClass = () => {
        document.body.classList.remove('cloud-banner--fixed');
    }

    render() {
        const {userLimit, analytics, preferences} = this.props;

        if (isEmpty(this.props.analytics)) {
            // If the analytics aren't yet loaded, return null to avoid a flash of the banner
            return null;
        }

        if (!this.shouldShowBanner()) {
            this.removeFixedBannerClass();
            return null;
        }

        // If AT user limit, and banner hidden, don't render anything
        if (userLimit === analytics!.TOTAL_USERS &&
            preferences.some((pref) => pref.name === CloudBanners.HIDE && pref.value === 'true')) {
            this.removeFixedBannerClass();
            return null;
        }

        let dismissable = true;

        // If the user limit is less than the current number of users, the banner is not dismissable
        if (userLimit < analytics!.TOTAL_USERS) {
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
                        {dismissable ? (
                            <FormattedMessage
                                id={'upgrade.cloud_banner_reached'}
                                defaultMessage={'You have reached the user limit of the free tier'}
                            />
                        ) : (
                            <FormattedMessage
                                id={'upgrade.cloud_banner_over'}
                                defaultMessage={'You are currently over the user limit for the free tier'}
                            />
                        )
                        }
                    </div>
                    <button
                        onClick={this.handleButtonClick}
                        className='upgrade-button'
                    >
                        <FormattedMessage
                            id={'admin.billing.subscription.upgradeMattermostCloud.upgradeButton'}
                            defaultMessage={'Upgrade Mattermost Cloud'}
                        />
                    </button>
                    {closeButton}
                </div>
            </div>
        );
    }
}
