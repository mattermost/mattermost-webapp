// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage, intlShape} from 'react-intl';

import {isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod} from 'utils/license_utils.jsx';
import {AnnouncementBarTypes, AnnouncementBarMessages} from 'utils/constants.jsx';

import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import AnnouncementBar from './announcement_bar.jsx';
import TextDismissableBar from './text_dismissable_bar';

const RENEWAL_LINK = 'https://licensing.mattermost.com/renew';

export default class ConfigurationAnnouncementBar extends React.PureComponent {
    static propTypes = {
        config: PropTypes.object,
        license: PropTypes.object,
        user: PropTypes.object,
        canViewSystemErrors: PropTypes.bool.isRequired,
        totalUsers: PropTypes.number,
    };

    static contextTypes = {
        intl: intlShape,
    };

    render() {
        // System administrators
        if (this.props.config.CanViewSystemErrors) {
            const renewalLink = RENEWAL_LINK + '?id=' + this.props.license.id + '&user_count=' + this.props.totalUsers;
            if (isLicensePastGracePeriod()) {
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

            if (isLicenseExpired()) {
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

            if (isLicenseExpiring()) {
                return (
                    <AnnouncementBar
                        type={AnnouncementBarTypes.CRITICAL}
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
        } else {
            // Regular users
            if (isLicensePastGracePeriod()) { //eslint-disable-line no-lonely-if
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

        const {formatMessage} = this.context.intl;

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
                defaultMessage = 'Please configure your [Site URL](https://docs.mattermost.com/administration/config-settings.html#site-url) in the [System Console](/admin_console/general/configuration) or in gitlab.rb if you\'re using GitLab Mattermost.';
            } else {
                id = t('announcement_bar.error.site_url.full');
                defaultMessage = 'Please configure your [Site URL](https://docs.mattermost.com/administration/config-settings.html#site-url) in the [System Console](/admin_console/general/configuration).';
            }

            const siteURLMessage = formatMessage({id, defaultMessage});

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
