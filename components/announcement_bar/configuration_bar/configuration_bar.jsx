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

import ackIcon from 'images/icons/check-circle-outline.svg';
import alertIcon from 'images/icons/round-white-info-icon.svg';

const RENEWAL_LINK = 'https://mattermost.com/renew/';

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
        dismissedNumberOfActiveUsersWarnMetricStatusAck: PropTypes.bool,
        dismissedNumberOfPostsWarnMetricStatus: PropTypes.bool,
        dismissedNumberOfPostsWarnMetricStatusAck: PropTypes.bool,
        siteURL: PropTypes.string.isRequired,
        warnMetricsStatus: PropTypes.object,
        actions: PropTypes.shape({
            dismissNotice: PropTypes.func.isRequired,
        }).isRequired,
    };

    dismissExpiringLicense = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.LICENSE_EXPIRING);
    }

    dismissNumberOfActiveUsersWarnMetric = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS);
    }

    dismissNumberOfPostsWarnMetric = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS);
    }

    dismissNumberOfActiveUsersWarnMetricAck = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS_ACK);
    }

    dismissNumberOfPostsWarnMetricAck = () => {
        this.props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS_ACK);
    }

    getNoticeForWarnMetric = (warnMetricStatus) => {
        if (!warnMetricStatus ||
            (warnMetricStatus.id !== WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500 &&
            warnMetricStatus.id !== WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M)) {
            return null;
        }

        var message = '';
        var type = '';
        var showModal = false;
        var dismissFunc = null;
        var isDismissed = null;
        var canCloseBar = false;

        if (warnMetricStatus.acked) {
            message = (
                <React.Fragment>
                    <img
                        className='advisor-icon'
                        src={ackIcon}
                    />
                    <FormattedMessage
                        id='announcement_bar.warn_metric_status_ack.text'
                        defaultMessage='Thank you for contacting Mattermost. We will follow up with you soon.'
                    />
                </React.Fragment>
            );

            if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
                dismissFunc = this.dismissNumberOfActiveUsersWarnMetricAck;
                isDismissed = this.props.dismissedNumberOfActiveUsersWarnMetricStatusAck;
            } else if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M) {
                dismissFunc = this.dismissNumberOfPostsWarnMetricAck;
                isDismissed = this.props.dismissedNumberOfPostsWarnMetricStatusAck;
            }

            type = AnnouncementBarTypes.ADVISOR_ACK;
            showModal = false;
            canCloseBar = true;
        } else {
            if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
                message = (
                    <React.Fragment>
                        <img
                            className='advisor-icon'
                            src={alertIcon}
                        />
                        <FormattedMarkdownMessage
                            id='announcement_bar.number_active_users_warn_metric_status.text'
                            defaultMessage='You now have over {limit} users. We strongly recommend using advanced features for large-scale servers.'
                            values={{
                                limit: warnMetricStatus.limit,
                            }}
                        />
                    </React.Fragment>
                );
                dismissFunc = this.dismissNumberOfActiveUsersWarnMetric;
                isDismissed = this.props.dismissedNumberOfActiveUsersWarnMetricStatus;
            } else if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M) {
                message = (
                    <React.Fragment>
                        <img
                            className='advisor-icon'
                            src={alertIcon}
                        />
                        <FormattedMarkdownMessage
                            id='announcement_bar.number_of_posts_warn_metric_status.text'
                            defaultMessage='You now have over {limit} posts. We strongly recommend using advanced features for large-scale servers.'
                            values={{
                                limit: warnMetricStatus.limit,
                            }}
                        />
                    </React.Fragment>
                );
                dismissFunc = this.dismissNumberOfPostsWarnMetric;
                isDismissed = this.props.dismissedNumberOfPostsWarnMetricStatus;
            }
            type = AnnouncementBarTypes.ADVISOR;
            showModal = true;
            canCloseBar = false;
        }
        return {
            Message: message,
            DismissFunc: dismissFunc,
            IsDismissed: isDismissed,
            Type: type,
            ShowModal: showModal,
            CanCloseBar: canCloseBar,
        };
    }

    render() {
        // System administrators
        if (this.props.canViewSystemErrors) {
            const renewalLink = `${RENEWAL_LINK}?id=${this.props.license.Id}&user_count=${this.props.totalUsers}`;
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
            if (this.props.license?.IsLicensed === 'false' &&
                this.props.warnMetricsStatus) {
                for (const status of Object.values(this.props.warnMetricsStatus)) {
                    var notice = this.getNoticeForWarnMetric(status);
                    if (!notice || notice.IsDismissed) {
                        continue;
                    }

                    return (
                        <AnnouncementBar
                            showCloseButton={notice.CanCloseBar}
                            handleClose={notice.DismissFunc}
                            type={notice.Type}
                            showModal={notice.ShowModal}
                            modalButtonText={t('announcement_bar.error.warn_metric_status.link')}
                            modalButtonDefaultText='Learn more'
                            warnMetricStatus={status}
                            message={notice.Message}
                        />
                    );
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
