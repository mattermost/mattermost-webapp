// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage, injectIntl} from 'react-intl';

import {isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod} from 'utils/license_utils.jsx';
import {AnnouncementBarTypes, AnnouncementBarMessages, WarnMetricTypes} from 'utils/constants';
import {intlShape} from 'utils/react_intl';

import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import AnnouncementBar from '../default_announcement_bar';
import TextDismissableBar from '../text_dismissable_bar';

const RENEWAL_LINK = 'https://licensing.mattermost.com/renew';

class ConfigurationAnnouncementBar extends React.PureComponent {
    static propTypes = {
        config: PropTypes.object,
        intl: intlShape.isRequired,
        license: PropTypes.object,
        user: PropTypes.object,
        canViewSystemErrors: PropTypes.bool.isRequired,
        totalUsers: PropTypes.number,
        dismissedExpiringLicense: PropTypes.bool,
        dismissedNumberOfActiveUsersWarnMetricStatus: PropTypes.bool,
        dismissedNumberOfActiveUsersWarnMetricStatus2: PropTypes.bool,
        siteURL: PropTypes.string.isRequired,
        dismissWarnMetricStatus: PropTypes.bool,
        warnMetricsStatus: PropTypes.object,
        actions: PropTypes.shape({
            dismissNotice: PropTypes.func.isRequired,
        }).isRequired,
    };

    dismissExpiringLicense = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.LICENSE_EXPIRING);
    }

    dismissNumberOfActiveUsersWarnMetric = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.NUMBER_OF_ACTIVE_USERS_WARN_METRIC_STATUS);
    }

    getNoticeForWarnMetricId = (warnMetricId) => {
        switch (warnMetricId) {
        case WarnMetricTypes.SYSTEM_NUMBER_OF_ACTIVE_USERS_WARN_METRIC:
            return {
                Id: AnnouncementBarMessages.NUMBER_OF_ACTIVE_USERS_WARN_METRIC_STATUS,
                DefaultText: 'The number of active users is greater than the supported limit. Please acknowledge and upgrade.',
                DismissFunc: this.dismissNumberOfActiveUsersWarnMetric,
                IsDismissed: this.props.dismissedNumberOfActiveUsersWarnMetricStatus,
            };
        default:
            return null;
        }
    }

    render() {
        // System administrators
        if (this.props.canViewSystemErrors) {
            const renewalLink = RENEWAL_LINK + '?id=' + this.props.license.id + '&user_count=' + this.props.totalUsers;
            if (isLicensePastGracePeriod(this.props.license)) {
                return (
                    <AnnouncementBar
                        type={AnnouncementBarTypes.CRITICAL}
                        message={
                            <FormattedMarkdownMessage
                                id={AnnouncementBarMessages.LICENSE_EXPIRED}
                                defaultMessage='Enterprise license is expired and some features may be disabled. [Please renew](!{link}).'
                                values={{
                                    link: renewalLink,
                                }}
                            />
                        }
                    />
                );
            }

            if (isLicenseExpired(this.props.license)) {
                return (
                    <AnnouncementBar
                        type={AnnouncementBarTypes.CRITICAL}
                        message={
                            <FormattedMarkdownMessage
                                id={AnnouncementBarMessages.LICENSE_EXPIRED}
                                defaultMessage='Enterprise license is expired and some features may be disabled. [Please renew](!{link}).'
                                values={{
                                    link: renewalLink,
                                }}
                            />
                        }
                    />
                );
            }

            if (isLicenseExpiring(this.props.license) && !this.props.dismissedExpiringLicense) {
                return (
                    <AnnouncementBar
                        showCloseButton={true}
                        handleClose={this.dismissExpiringLicense}
                        type={AnnouncementBarTypes.ANNOUNCEMENT}
                        message={
                            <FormattedMarkdownMessage
                                id={AnnouncementBarMessages.LICENSE_EXPIRING}
                                defaultMessage='Enterprise license expires on {date, date, long}. [Please renew](!{link}).'
                                values={{
                                    date: new Date(parseInt(this.props.license.ExpiresAt, 10)),
                                    link: renewalLink,
                                }}
                            />
                        }
                    />
                );
            }
            if (this.props.warnMetricsStatus) {
                for (const [id, flag] of Object.entries(this.props.warnMetricsStatus)) {
                    if (flag) {
                        var notice = this.getNoticeForWarnMetricId(id);
                        if (!notice.IsDismissed) {
                            return (
                                <AnnouncementBar
                                    showCloseButton={true}
                                    handleClose={notice.DismissFunc}
                                    type={AnnouncementBarTypes.LICENSE_EXPIRED}
                                    showModal={true}
                                    modalButtonText={t('announcement_bar.error.number_active_users_warn_metric_status.link')}
                                    modalButtonDefaultText={'Acknowledge'}
                                    warnMetricId={id}
                                    message={
                                        <FormattedMarkdownMessage
                                            id={notice.Id}
                                            defaultMessage={notice.DefaultText}
                                        />
                                    }
                                />
                            );
                        }
                    }
                }
            }
        } else {
            // Regular users
            if (isLicensePastGracePeriod(this.props.license)) { //eslint-disable-line no-lonely-if
                return (
                    <AnnouncementBar
                        type={AnnouncementBarTypes.CRITICAL}
                        message={
                            <FormattedMessage
                                id={AnnouncementBarMessages.LICENSE_PAST_GRACE}
                                defaultMessage='Enterprise license is expired and some features may be disabled. Please contact your System Administrator for details.'
                            />
                        }
                    />
                );
            }
        }

        const {formatMessage} = this.props.intl;

        if (this.props.config.SendEmailNotifications !== 'true' &&
            this.props.config.EnablePreviewModeBanner === 'true'
        ) {
            const emailMessage = formatMessage({
                id: AnnouncementBarMessages.PREVIEW_MODE,
                defaultMessage: 'Preview Mode: Email notifications have not been configured',
            });

            return (
                <TextDismissableBar
                    allowDismissal={true}
                    text={emailMessage}
                    type={AnnouncementBarTypes.ANNOUNCEMENT}
                />
            );
        }

        if (this.props.canViewSystemErrors && this.props.config.SiteURL === '') {
            let id;
            let defaultMessage;
            if (this.props.config.EnableSignUpWithGitLab === 'true') {
                id = t('announcement_bar.error.site_url_gitlab.full');
                defaultMessage = 'Please configure your [site URL](https://docs.mattermost.com/administration/config-settings.html#site-url) either on the [System Console](/admin_console/environment/web_server) or, if you\'re using GitLab Mattermost, in gitlab.rb.';
            } else {
                id = t('announcement_bar.error.site_url.full');
                defaultMessage = 'Please configure your [site URL](https://docs.mattermost.com/administration/config-settings.html#site-url) on the [System Console](/admin_console/environment/web_server).';
            }

            const values = {siteURL: this.props.siteURL};
            const siteURLMessage = formatMessage({id, defaultMessage}, values);

            return (
                <TextDismissableBar
                    allowDismissal={true}
                    text={siteURLMessage}
                    type={AnnouncementBarTypes.ANNOUNCEMENT}
                />
            );
        }

        return null;
    }
}

export default injectIntl(ConfigurationAnnouncementBar);
