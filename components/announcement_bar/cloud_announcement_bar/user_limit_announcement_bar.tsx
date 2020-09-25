// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {isEmpty} from 'lodash';

import {t} from 'utils/i18n';

import {Preferences, CloudBanners, AnnouncementBarTypes} from 'utils/constants';

import AnnouncementBar from '../default_announcement_bar';

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

export default class UserLimitAnnouncementBar extends React.PureComponent<Props> {
    async componentDidMount() {
        if (isEmpty(this.props.analytics)) {
            await this.props.actions.getStandardAnalytics();
        }
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

        if (!userLimit || userLimit > analytics!.TOTAL_USERS || !userLimit) {
            return false;
        }

        return true;
    }

    render() {
        const {userLimit, analytics, preferences} = this.props;

        if (isEmpty(this.props.analytics)) {
            // If the analytics aren't yet loaded, return null to avoid a flash of the banner
            return null;
        }

        if (!this.shouldShowBanner()) {
            return null;
        }

        // If AT user limit, and banner hidden, don't render anything
        if (userLimit === analytics!.TOTAL_USERS &&
            preferences.some((pref) => pref.name === CloudBanners.HIDE && pref.value === 'true')) {
            return null;
        }

        let dismissable = true;

        // If the user limit is less than the current number of users, the banner is not dismissable
        if (userLimit < analytics!.TOTAL_USERS) {
            dismissable = false;
        }

        return (
            <AnnouncementBar
                type={dismissable ? AnnouncementBarTypes.ADVISOR : AnnouncementBarTypes.CRITICAL_LIGHT}
                showCloseButton={dismissable}
                handleClose={this.handleClose}
                showModal={() => {}}
                modalButtonText={t('admin.billing.subscription.upgradeMattermostCloud.upgradeButton')}
                modalButtonDefaultText={'Upgrade Mattermost Cloud'}
                message={dismissable ? t('upgrade.cloud_banner_reached') : t('upgrade.cloud_banner_over')}
                showLinkAsButton={true}
                isTallBanner={true}
            />

        );
    }
}
