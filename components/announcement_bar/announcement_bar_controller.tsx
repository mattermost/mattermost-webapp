// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ClientLicense, ClientConfig, WarnMetricStatus} from 'mattermost-redux/types/config';
import {Dictionary} from 'mattermost-redux/types/utilities';

import ConfigurationAnnouncementBar from './configuration_bar';
import VersionBar from './version_bar';
import TextDismissableBar from './text_dismissable_bar';
import AnnouncementBar from './default_announcement_bar';

import CloudAnnouncementBar from './cloud_announcement_bar';
import EnableNotificationsBar from './enable_notifications_bar';
import PaymentAnnouncementBar from './payment_announcement_bar';
import CloudTrialAnnouncementBar from './cloud_trial_announcement_bar';
import AutoStartTrialModal from './show_start_trial_modal/show_start_trial_modal';

type Props = {
    license?: ClientLicense;
    config?: Partial<ClientConfig>;
    canViewSystemErrors: boolean;
    latestError?: {
        error: any;
    };
    warnMetricsStatus?: Dictionary<WarnMetricStatus>;
    actions: {
        dismissError: (index: number) => void;
    };
}

export default class AnnouncementBarController extends React.PureComponent<Props> {
    render() {
        let adminConfiguredAnnouncementBar = null;
        if (this.props.config?.EnableBanner === 'true' && this.props.config.BannerText?.trim()) {
            adminConfiguredAnnouncementBar = (
                <TextDismissableBar
                    color={this.props.config.BannerColor}
                    textColor={this.props.config.BannerTextColor}
                    allowDismissal={this.props.config.AllowBannerDismissal === 'true'}
                    text={this.props.config.BannerText}
                />
            );
        }

        let errorBar = null;
        if (this.props.latestError) {
            errorBar = (
                <AnnouncementBar
                    type={this.props.latestError.error.type}
                    message={this.props.latestError.error.message}
                    showCloseButton={true}
                    handleClose={this.props.actions.dismissError}
                />
            );
        }
        let cloudAnnouncementBar = null;
        let paymentAnnouncementBar = null;
        let cloudTrialAnnouncementBar = null;
        if (this.props.license?.Cloud === 'true') {
            cloudAnnouncementBar = (
                <CloudAnnouncementBar/>
            );
            paymentAnnouncementBar = (
                <PaymentAnnouncementBar/>
            );
            cloudTrialAnnouncementBar = (
                <CloudTrialAnnouncementBar/>
            );
        }

        return (
            <>
                {adminConfiguredAnnouncementBar}
                {errorBar}
                {cloudAnnouncementBar}
                {paymentAnnouncementBar}
                {cloudTrialAnnouncementBar}
                <AutoStartTrialModal/>
                <VersionBar/>
                <ConfigurationAnnouncementBar
                    config={this.props.config}
                    license={this.props.license}
                    canViewSystemErrors={this.props.canViewSystemErrors}
                    warnMetricsStatus={this.props.warnMetricsStatus}
                />
                <EnableNotificationsBar />
            </>
        );
    }
}
