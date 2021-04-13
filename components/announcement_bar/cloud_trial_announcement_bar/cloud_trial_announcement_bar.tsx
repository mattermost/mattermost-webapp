// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {isEmpty} from 'lodash';

import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {Subscription} from 'mattermost-redux/types/cloud';

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
import withGetCloudSubscription from '../../common/hocs/cloud/with_get_cloud_subcription';

type Props = {
    userIsAdmin: boolean;
    isFreeTrial: boolean;
    currentUser: UserProfile;
    preferences: PreferenceType[];
    daysLeftOnTrial: number;
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

enum TrialPeriodDays {
    TRIAL_14_DAYS = 14,
    TRIAL_3_DAYS = 3,
    TRIAL_2_DAYS = 2,
    TRIAL_1_DAY = 1,
    TRIAL_0_DAYS = 0
}

class CloudTrialAnnouncementBar extends React.PureComponent<Props> {
    async componentDidMount() {
        if (isEmpty(this.props.analytics)) {
            await this.props.actions.getStandardAnalytics();
        }

        if (!isEmpty(this.props.subscription) && !isEmpty(this.props.analytics) && this.shouldShowBanner()) {
            const {daysLeftOnTrial} = this.props;
            if (this.isDismissable()) {
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                    `bannerview_trial_${daysLeftOnTrial}_days`,
                );
            } else {
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                    'bannerview_trial_limit_ended',
                );
            }
        }
    }

    handleClose = async () => {
        const {daysLeftOnTrial} = this.props;
        let dismissValue = '';
        if (daysLeftOnTrial > TrialPeriodDays.TRIAL_3_DAYS) {
            dismissValue = '14_days_banner1';
        } else if (daysLeftOnTrial <= TrialPeriodDays.TRIAL_3_DAYS && daysLeftOnTrial > TrialPeriodDays.TRIAL_0_DAYS) {
            dismissValue = '3_days_banner1';
        }
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            `dismissed_banner_trial_${daysLeftOnTrial}_days`,
        );
        await this.props.actions.savePreferences(this.props.currentUser.id, [{
            category: Preferences.CLOUD_TRIAL_BANNER,
            user_id: this.props.currentUser.id,
            name: CloudBanners.TRIAL,
            value: `${dismissValue}`,
        }]);
    }

    shouldShowBanner = () => {
        const {isFreeTrial, userIsAdmin, isCloud} = this.props;
        return isFreeTrial && userIsAdmin && isCloud;
    }

    isDismissable = () => {
        const {daysLeftOnTrial} = this.props;
        let dismissable = true;

        if (daysLeftOnTrial <= TrialPeriodDays.TRIAL_1_DAY) {
            dismissable = false;
        }
        return dismissable;
    }

    showModal = () => {
        const {daysLeftOnTrial} = this.props;
        if (this.isDismissable()) {
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                `click_subscribe_from_trial_banner_${daysLeftOnTrial}_days`,
            );
        } else {
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                'click_subscribe_from_banner_trial_ended',
            );
        }
        this.props.actions.openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        });
    }

    render() {
        const {daysLeftOnTrial, preferences} = this.props;

        if (isEmpty(this.props.analytics)) {
            // If the analytics aren't yet loaded, return null to avoid a flash of the banner
            return null;
        }

        if (!this.shouldShowBanner()) {
            return null;
        }

        if ((preferences.some((pref) => pref.name === CloudBanners.TRIAL && pref.value === '14_days_banner1') && daysLeftOnTrial > TrialPeriodDays.TRIAL_3_DAYS) ||
            ((daysLeftOnTrial <= TrialPeriodDays.TRIAL_3_DAYS && daysLeftOnTrial > TrialPeriodDays.TRIAL_0_DAYS) &&
            preferences.some((pref) => pref.name === CloudBanners.TRIAL && pref.value === '3_days_banner1'))) {
            return null;
        }

        const trialMoreThan3DaysMsg = (
            <FormattedMessage
                id='admin.billing.subscription.cloudTrial.moreThan3Days'
                defaultMessage='Your trial has started! There are {daysLeftOnTrial} days left'
                values={{daysLeftOnTrial}}
            />
        );

        const trialLessThan3DaysMsg = (
            <FormattedMessage
                id='admin.billing.subscription.cloudTrial.daysLeftOnTrial'
                defaultMessage='There are {daysLeftOnTrial} days left on your free trial'
                values={{daysLeftOnTrial}}
            />
        );

        let bannerMessage;
        let icon;
        switch (daysLeftOnTrial) {
        case TrialPeriodDays.TRIAL_3_DAYS:
        case TrialPeriodDays.TRIAL_2_DAYS:
            bannerMessage = trialLessThan3DaysMsg;
            break;
        case TrialPeriodDays.TRIAL_1_DAY:
            bannerMessage = t('admin.billing.subscription.cloudTrial.lastDay');
            break;
        default:
            bannerMessage = trialMoreThan3DaysMsg;
            icon = <i className='icon-check-outline-circle'/>;
            break;
        }

        const dismissable = this.isDismissable();

        return (
            <AnnouncementBar
                type={dismissable ? AnnouncementBarTypes.ADVISOR : AnnouncementBarTypes.CRITICAL}
                showCloseButton={dismissable}
                handleClose={this.handleClose}
                onButtonClick={this.showModal}
                modalButtonText={t('admin.billing.subscription.cloudTrial.subscribeNow')}
                modalButtonDefaultText={'Subscribe Now'}
                message={bannerMessage}
                showLinkAsButton={true}
                icon={icon}
            />
        );
    }
}

export default withGetCloudSubscription(CloudTrialAnnouncementBar);
