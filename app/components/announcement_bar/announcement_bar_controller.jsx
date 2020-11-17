// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ConfigurationAnnouncementBar from './configuration_bar';
import VersionBar from './version_bar';
import TextDismissableBar from './text_dismissable_bar.jsx';
import AnnouncementBar from './default_announcement_bar';

import CloudAnnouncementBar from './cloud_announcement_bar';
import PaymentAnnouncementBar from './payment_announcement_bar';

export default class AnnouncementBarController extends React.PureComponent {
    static propTypes = {
        license: PropTypes.object,
        config: PropTypes.object,
        user: PropTypes.shape({
            email: PropTypes.string.isRequired,
            email_verified: PropTypes.bool,
        }),
        canViewSystemErrors: PropTypes.bool.isRequired,
        latestError: PropTypes.object,
        totalUsers: PropTypes.number,
        warnMetricsStatus: PropTypes.object,
        actions: PropTypes.shape({
            dismissError: PropTypes.func.isRequired,
        }).isRequired,
    }

    render() {
        let adminConfiguredAnnouncementBar = null;
        if (this.props.config.EnableBanner === 'true' && this.props.config.BannerText.trim()) {
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
        if (this.props.license.Cloud === 'true') {
            cloudAnnouncementBar = (
                <CloudAnnouncementBar/>
            );
            paymentAnnouncementBar = (
                <PaymentAnnouncementBar/>
            );
        }

        return (
            <React.Fragment>
                {adminConfiguredAnnouncementBar}
                {errorBar}
                {cloudAnnouncementBar}
                {paymentAnnouncementBar}
                <VersionBar/>
                <ConfigurationAnnouncementBar
                    config={this.props.config}
                    license={this.props.license}
                    canViewSystemErrors={this.props.canViewSystemErrors}
                    totalUsers={this.props.totalUsers}
                    user={this.props.user}
                    warnMetricsStatus={this.props.warnMetricsStatus}
                />
            </React.Fragment>
        );
    }
}
