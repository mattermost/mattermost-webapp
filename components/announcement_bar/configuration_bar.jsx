// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod} from 'utils/license_utils.jsx';
import {AnnouncementBarTypes, AnnouncementBarMessages} from 'utils/constants.jsx';

import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import AnnouncementBar from './announcement_bar.jsx';
import TextButtonWithSpinner from './text_button_with_spinner.jsx';

const RENEWAL_LINK = 'https://licensing.mattermost.com/renew';

export default class ConfigurationAnnouncementBar extends React.PureComponent {
    static propTypes = {
        config: PropTypes.object,
        license: PropTypes.object,
        user: PropTypes.object,
        canViewSystemErrors: PropTypes.bool.isRequired,
        totalUsers: PropTypes.number,
        sendVerificationEmail: PropTypes.func.isRequired,
    };

    handleEmailResend = (email) => {
        this.props.sendVerificationEmail(email);
    }

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

        if (!this.props.config.SendEmailNotifications === 'true' &&
            this.props.config.EnablePreviewModeBanner === 'true') {
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <FormattedMessage
                            id={AnnouncementBarMessages.PREVIEW_MODE}
                            defaultMessage='Preview Mode: Email notifications have not been configured'
                        />
                    }
                />
            );
        }

        if (this.props.canViewSystemErrors && this.props.config.SiteURL === '') {
            let id;
            let defaultMessage;
            if (this.props.config.EnableSignUpWithGitLab === 'true') {
                id = t('announcement_bar.error.site_url_gitlab');
                defaultMessage = 'Please configure your {docsLink} in the System Console or in gitlab.rb if you\'re using GitLab Mattermost.';
            } else {
                id = t('announcement_bar.error.site_url');
                defaultMessage = 'Please configure your {docsLink} in the System Console.';
            }

            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <FormattedMessage
                            id={id}
                            defaultMessage={defaultMessage}
                            values={{
                                docsLink: (
                                    <a
                                        href='https://docs.mattermost.com/administration/config-settings.html#site-url'
                                        rel='noopener noreferrer'
                                        target='_blank'
                                    >
                                        <FormattedMessage
                                            id='announcement_bar.error.site_url.docsLink'
                                            defaultMessage='Site URL'
                                        />
                                    </a>
                                ),
                                link: (
                                    <Link to='/admin_console/general/configuration'>
                                        <FormattedMessage
                                            id='announcement_bar.error.site_url.link'
                                            defaultMessage='the System Console'
                                        />
                                    </Link>
                                ),
                            }}
                        />
                    }
                />
            );
        }

        if (this.props.user && !this.props.user.email_verified && this.props.config.RequireEmailVerification === 'true') {
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <React.Fragment>
                            <FormattedHTMLMessage
                                id={AnnouncementBarMessages.EMAIL_VERIFICATION_REQUIRED}
                                defaultMessage='Check your email at {email} to verify the address. Cannot find the email?'
                                values={{
                                    email: this.props.user.email,
                                }}
                            />
                            <TextButtonWithSpinner
                                spinningText={
                                    <FormattedMessage
                                        id='announcement_bar.error.sending'
                                        defaultMessage='Sending'
                                    />
                                }
                                regularText={
                                    <FormattedMessage
                                        id='announcement_bar.error.send_again'
                                        defaultMessage='Send again'
                                    />
                                }
                                onClick={this.handleEmailResend.bind(null, this.props.user.email)}
                            />
                        </React.Fragment>
                    }
                />
            );
        }

        return null;
    }
}
