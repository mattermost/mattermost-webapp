// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {ClientConfig, WarnMetricStatus} from 'mattermost-redux/types/config';

import {Dictionary} from 'mattermost-redux/types/utilities';

import {isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod} from 'utils/license_utils.jsx';
import {AnnouncementBarTypes, AnnouncementBarMessages, WarnMetricTypes} from 'utils/constants';

import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import AnnouncementBar from '../default_announcement_bar';
import TextDismissableBar from '../text_dismissable_bar';

import ackIcon from 'images/icons/check-circle-outline.svg';
import alertIcon from 'images/icons/round-white-info-icon.svg';
import warningIcon from 'images/icons/warning-icon.svg';

import UserProfile from 'components/user_profile/user_profile';
import RenewalLink from '../renewal_link/';

type Props = {
    config?: Partial<ClientConfig>;
    intl: IntlShape;
    license?: any;
    user?: UserProfile;
    canViewSystemErrors: boolean;
    totalUsers?: number;
    dismissedExpiringLicense?: boolean;
    dismissedNumberOfActiveUsersWarnMetricStatus?: boolean;
    dismissedNumberOfActiveUsersWarnMetricStatusAck?: boolean;
    dismissedNumberOfPostsWarnMetricStatus?: boolean;
    dismissedNumberOfPostsWarnMetricStatusAck?: boolean;
    siteURL: string;
    warnMetricsStatus?: {
        [key: string]: Dictionary<WarnMetricStatus>;
    };
    actions: {
        dismissNotice: (notice: string) => void;
    };
};

const ConfigurationAnnouncementBar: React.FC<Props> = (props: Props) => {
    const dismissExpiringLicense = () => {
        props.actions.dismissNotice(AnnouncementBarMessages.LICENSE_EXPIRING);
    };

    const dismissNumberOfActiveUsersWarnMetric = () => {
        props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS);
    };

    const dismissNumberOfPostsWarnMetric = () => {
        props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS);
    };

    const dismissNumberOfActiveUsersWarnMetricAck = () => {
        props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS_ACK);
    };

    const dismissNumberOfPostsWarnMetricAck = () => {
        props.actions.dismissNotice(AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS_ACK);
    };

    const renewLinkTelemetry = {success: 'renew_license_banner_success', error: 'renew_license_banner_fail'};

    const getNoticeForWarnMetric = (warnMetricStatus: any) => {
        if (!warnMetricStatus ||
            (warnMetricStatus.id !== WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500 &&
            warnMetricStatus.id !== WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M)) {
            return null;
        }

        let message: JSX.Element | string = '';
        let type = '';
        let showModal = false;
        let dismissFunc;
        let isDismissed = null;
        let canCloseBar = false;

        if (warnMetricStatus.acked) {
            message = (
                <>
                    <img
                        className='advisor-icon'
                        src={ackIcon}
                    />
                    <FormattedMessage
                        id='announcement_bar.warn_metric_status_ack.text'
                        defaultMessage='Thank you for contacting Mattermost. We will follow up with you soon.'
                    />
                </>
            );

            if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
                dismissFunc = dismissNumberOfActiveUsersWarnMetricAck;
                isDismissed = props.dismissedNumberOfActiveUsersWarnMetricStatusAck;
            } else if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M) {
                dismissFunc = dismissNumberOfPostsWarnMetricAck;
                isDismissed = props.dismissedNumberOfPostsWarnMetricStatusAck;
            }

            type = AnnouncementBarTypes.ADVISOR_ACK;
            showModal = false;
            canCloseBar = true;
        } else {
            if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
                message = (
                    <>
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
                    </>
                );
                dismissFunc = dismissNumberOfActiveUsersWarnMetric;
                isDismissed = props.dismissedNumberOfActiveUsersWarnMetricStatus;
            } else if (warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M) {
                message = (
                    <>
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
                    </>
                );
                dismissFunc = dismissNumberOfPostsWarnMetric;
                isDismissed = props.dismissedNumberOfPostsWarnMetricStatus;
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
    };

    // System administrators
    if (props.canViewSystemErrors) {
        if (isLicensePastGracePeriod(props.license)) {
            const message = (<>
                <img
                    className='advisor-icon'
                    src={warningIcon}
                />
                <FormattedMessage
                    id='announcement_bar.error.license_expired'
                    defaultMessage='Enterprise license is expired and some features may be disabled.'
                />
            </>);
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <>
                            {message}
                            <RenewalLink telemetryInfo={renewLinkTelemetry}/>
                        </>
                    }
                    tooltipMsg={message}
                />
            );
        }

        if (isLicenseExpired(props.license)) {
            const message = (<>
                <img
                    className='advisor-icon'
                    src={warningIcon}
                />
                <FormattedMessage
                    id='announcement_bar.error.license_expired'
                    defaultMessage='Enterprise license is expired and some features may be disabled.'
                />
            </>);
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <>
                            {message}
                            <RenewalLink telemetryInfo={renewLinkTelemetry}/>
                        </>
                    }
                    tooltipMsg={message}
                />
            );
        }

        if (isLicenseExpiring(props.license) && !props.dismissedExpiringLicense) {
            const message = (<>
                <img
                    className='advisor-icon'
                    src={alertIcon}
                />
                <FormattedMessage
                    id='announcement_bar.error.license_expiring'
                    defaultMessage='Enterprise license expires on {date, date, long}.'
                    values={{
                        date: new Date(parseInt(props.license?.ExpiresAt, 10)),
                    }}
                />
            </>);
            return (
                <AnnouncementBar
                    showCloseButton={true}
                    handleClose={dismissExpiringLicense}
                    type={AnnouncementBarTypes.ANNOUNCEMENT}
                    message={
                        <>
                            {message}
                            <RenewalLink telemetryInfo={renewLinkTelemetry}/>
                        </>
                    }
                    tooltipMsg={message}
                />
            );
        }
        if (props.license?.IsLicensed === 'false' &&
                props.warnMetricsStatus) {
            for (const status of Object.values(props.warnMetricsStatus)) {
                const notice = getNoticeForWarnMetric(status);
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
        if (isLicensePastGracePeriod(props.license)) { //eslint-disable-line no-lonely-if
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <>
                            <img
                                className='advisor-icon'
                                src={warningIcon}
                            />
                            <FormattedMessage
                                id={AnnouncementBarMessages.LICENSE_PAST_GRACE}
                                defaultMessage='Enterprise license is expired and some features may be disabled. Please contact your System Administrator for details.'
                            />
                        </>
                    }
                />
            );
        }
    }

    const {formatMessage} = props.intl;

    if (props.config?.SendEmailNotifications !== 'true' &&
            props.config?.EnablePreviewModeBanner === 'true'
    ) {
        const emailMessage = formatMessage({
            id: AnnouncementBarMessages.PREVIEW_MODE,
            defaultMessage: 'Preview Mode: Email notifications have not been configured',
        });

        return (
            <TextDismissableBar
                allowDismissal={true}
                text={emailMessage}
                type={AnnouncementBarTypes.SUCCESS}
            />
        );
    }

    if (props.canViewSystemErrors && props.config?.SiteURL === '') {
        let id;
        let defaultMessage;
        if (props.config?.EnableSignUpWithGitLab === 'true') {
            id = t('announcement_bar.error.site_url_gitlab.full');
            defaultMessage = 'Please configure your [site URL](https://docs.mattermost.com/administration/config-settings.html#site-url) either on the [System Console](/admin_console/environment/web_server) or, if you\'re using GitLab Mattermost, in gitlab.rb.';
        } else {
            id = t('announcement_bar.error.site_url.full');
            defaultMessage = 'Please configure your [site URL](https://docs.mattermost.com/administration/config-settings.html#site-url) on the [System Console](/admin_console/environment/web_server).';
        }

        const values = {siteURL: props.siteURL};
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
};

export default injectIntl(ConfigurationAnnouncementBar);
