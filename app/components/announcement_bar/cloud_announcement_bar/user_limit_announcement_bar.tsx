// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {Subscription} from 'mattermost-redux/types/cloud';
import {isEmpty} from 'lodash';

import {trackEvent} from 'actions/telemetry_actions';

import {t} from 'utils/i18n';
import PurchaseModal from 'components/purchase_modal';

import {
    Preferences,
    CloudBanners,
    AnnouncementBarTypes,
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import AnnouncementBar from '../default_announcement_bar';

type Props = {
    userLimit: number;
    userIsAdmin: boolean;
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isCloud: boolean;
    analytics?: Dictionary<number | AnalyticsRow[]>;
    subscription?: Subscription;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        getStandardAnalytics: () => void;
        getCloudSubscription: () => void;
        openModal: (modalData: { modalId: string; dialogType: any; dialogProps?: any }) => void;
    };
};

export default class UserLimitAnnouncementBar extends React.PureComponent<Props> {
    async componentDidMount() {
        if (isEmpty(this.props.analytics)) {
            await this.props.actions.getStandardAnalytics();
        }

        if (isEmpty(this.props.subscription)) {
            await this.props.actions.getCloudSubscription();
        }

        if (!isEmpty(this.props.subscription) && !isEmpty(this.props.analytics) && this.shouldShowBanner()) {
            if (this.isDismissable()) {
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                    'bannerview_user_limit_reached',
                );
            } else {
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                    'bannerview_user_limit_exceeded',
                );
            }
        }
    }

    handleButtonClick = () => {
        // Do nothing for now
    }

    handleClose = async () => {
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            'click_close_banner_user_limit_reached',
        );
        await this.props.actions.savePreferences(this.props.currentUser.id, [{
            category: Preferences.CLOUD_UPGRADE_BANNER,
            user_id: this.props.currentUser.id,
            name: CloudBanners.HIDE,
            value: 'true',
        }]);
    }

    shouldShowBanner = () => {
        const {userLimit, analytics, userIsAdmin, isCloud, subscription} = this.props;

        // Prevents banner flashes if the subscription hasn't been loaded yet
        if (subscription === null) {
            return false;
        }

        if (subscription?.is_paid_tier === 'true') {
            return false;
        }

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

    isDismissable = () => {
        const {userLimit, analytics} = this.props;
        let dismissable = true;

        // If the user limit is less than the current number of users, the banner is not dismissable
        if (userLimit < analytics!.TOTAL_USERS) {
            dismissable = false;
        }
        return dismissable;
    }

    showModal = () => {
        if (this.isDismissable()) {
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                'click_upgrade_banner_user_limit_reached',
            );
        } else {
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                'click_upgrade_banner_user_limit_exceeded',
            );
        }
        this.props.actions.openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        });
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

        const dismissable = this.isDismissable();

        return (
            <AnnouncementBar
                type={dismissable ? AnnouncementBarTypes.ADVISOR : AnnouncementBarTypes.CRITICAL_LIGHT}
                showCloseButton={dismissable}
                handleClose={this.handleClose}
                showModal={this.showModal}
                modalButtonText={t('admin.billing.subscription.upgradeMattermostCloud.upgradeButton')}
                modalButtonDefaultText={'Upgrade Mattermost Cloud'}
                message={dismissable ? t('upgrade.cloud_banner_reached') : t('upgrade.cloud_banner_over')}
                showLinkAsButton={true}
                isTallBanner={true}
            />

        );
    }
}
