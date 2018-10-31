// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as AdminActions from 'actions/admin_actions.jsx';
import AnalyticsStore from 'stores/analytics_store.jsx';
import ErrorStore from 'stores/error_store.jsx';

import {AnnouncementBarTypes, AnnouncementBarMessages, StatTypes, StoragePrefixes} from 'utils/constants.jsx';
import {isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod} from 'utils/license_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

const RENEWAL_LINK = 'https://licensing.mattermost.com/renew';

export default class AnnouncementBar extends React.PureComponent {
    static propTypes = {

        /*
         * Set if the user is logged in
         */
        isLoggedIn: PropTypes.bool.isRequired,

        /*
         * Set if the user can view system errors
         */
        canViewSystemErrors: PropTypes.bool.isRequired,
        canViewAPIv3Banner: PropTypes.bool.isRequired,
        license: PropTypes.object,
        siteURL: PropTypes.string,
        sendEmailNotifications: PropTypes.bool.isRequired,
        bannerText: PropTypes.string,
        allowBannerDismissal: PropTypes.bool.isRequired,
        enableBanner: PropTypes.bool.isRequired,
        enablePreviewMode: PropTypes.bool.isRequired,
        bannerColor: PropTypes.string,
        bannerTextColor: PropTypes.string,
        enableSignUpWithGitLab: PropTypes.bool.isRequired,
        requireEmailVerification: PropTypes.bool,
        user: PropTypes.shape({
            email: PropTypes.string.isRequired,
            email_verified: PropTypes.bool,
        }),
        actions: PropTypes.shape({

            /*
             * Action creator to send a verification email to the user
             */
            sendVerificationEmail: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.onErrorChange = this.onErrorChange.bind(this);
        this.onAnalyticsChange = this.onAnalyticsChange.bind(this);
        this.handleClose = this.handleClose.bind(this);

        const lastError = ErrorStore.getLastError();
        if (lastError && lastError.message !== AnnouncementBarMessages.EMAIL_VERIFIED) {
            ErrorStore.clearLastError(true);
        }

        this.setInitialError();

        this.state = this.getState(props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.enableBanner !== this.props.enableBanner ||
                nextProps.bannerText !== this.props.bannerText ||
                nextProps.bannerColor !== this.props.bannerColor ||
                nextProps.bannerTextColor !== this.props.bannerTextColor ||
                nextProps.allowBannerDismissal !== this.props.allowBannerDismissal) {
            this.setState(this.getState(nextProps));
        }
    }

    handleEmailResend = (email) => {
        this.setState({resendStatus: 'sending', showSpinner: true});
        this.props.actions.sendVerificationEmail(email).then(({data, error: err}) => {
            if (data) {
                this.setState({resendStatus: 'success'});
            } else if (err) {
                this.setState({resendStatus: 'failure'});
            }
        });
    }

    createEmailResendLink = (email) => {
        let resendHTML;
        if (this.state && this.state.showSpinner) {
            resendHTML = (
                <React.Fragment>
                    <span className='fa-wrapper'>
                        <span
                            className='fa fa-spinner icon--rotate'
                            title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                        />
                    </span>
                    <FormattedMessage
                        id='announcement_bar.error.sending'
                        defaultMessage='Sending'
                    />
                </React.Fragment>
            );
        } else {
            resendHTML = (
                <span className='resend-verification-wrapper'>
                    <a
                        onClick={() => {
                            this.handleEmailResend(email);
                            setTimeout(() => {
                                this.setState({
                                    showSpinner: false,
                                });
                            }, 500);
                        }}
                    >
                        <FormattedMessage
                            id='announcement_bar.error.send_again'
                            defaultMessage='Send again'
                        />
                    </a>
                </span>
            );
        }
        return resendHTML;
    };
    setInitialError = () => {
        const errorIgnored = ErrorStore.getIgnoreNotification();

        if (!errorIgnored) {
            if (this.props.canViewSystemErrors && this.props.siteURL === '') {
                ErrorStore.storeLastError({notification: true, message: AnnouncementBarMessages.SITE_URL});
                return;
            } else if (!this.props.sendEmailNotifications && this.props.enablePreviewMode) {
                ErrorStore.storeLastError({notification: true, message: AnnouncementBarMessages.PREVIEW_MODE});
                return;
            }
        }

        if (isLicensePastGracePeriod()) {
            if (this.props.canViewSystemErrors) {
                ErrorStore.storeLastError({notification: true, message: AnnouncementBarMessages.LICENSE_EXPIRED, type: AnnouncementBarTypes.CRITICAL});
            } else {
                ErrorStore.storeLastError({notification: true, message: AnnouncementBarMessages.LICENSE_PAST_GRACE, type: AnnouncementBarTypes.CRITICAL});
            }
        } else if (isLicenseExpired() && this.props.canViewSystemErrors) {
            ErrorStore.storeLastError({notification: true, message: AnnouncementBarMessages.LICENSE_EXPIRED, type: AnnouncementBarTypes.CRITICAL});
        } else if (isLicenseExpiring() && this.props.canViewSystemErrors) {
            ErrorStore.storeLastError({notification: true, message: AnnouncementBarMessages.LICENSE_EXPIRING, type: AnnouncementBarTypes.CRITICAL});
        }

        if (this.props.isLoggedIn && this.props.user && !this.props.user.email_verified && this.props.requireEmailVerification) {
            ErrorStore.storeLastError({
                notification: true,
                message: AnnouncementBarMessages.EMAIL_VERIFICATION_REQUIRED,
            });
        }
    }

    getState(props = this.props) {
        const error = ErrorStore.getLastError();
        if (error && error.message) {
            return {message: error.message, color: null, textColor: null, type: error.type, allowDismissal: true};
        }

        const bannerText = props.bannerText || '';
        const allowDismissal = props.allowBannerDismissal;
        const bannerDismissed = localStorage.getItem(StoragePrefixes.ANNOUNCEMENT + props.bannerText);

        if (props.enableBanner &&
            bannerText.length > 0 &&
            (!bannerDismissed || !allowDismissal)
        ) {
            // Remove old local storage items
            Utils.removePrefixFromLocalStorage(StoragePrefixes.ANNOUNCEMENT);
            return {
                message: bannerText,
                color: props.bannerColor,
                textColor: props.bannerTextColor,
                type: AnnouncementBarTypes.ANNOUNCEMENT,
                allowDismissal,
            };
        }

        return {message: null, color: null, colorText: null, textColor: null, type: null, allowDismissal: true};
    }

    componentDidMount() {
        const isFixed = this.shouldRender(this.props, this.state) && !this.state.allowDismissal;
        if (isFixed) {
            document.body.classList.add('announcement-bar--fixed');
        }

        ErrorStore.addChangeListener(this.onErrorChange);
        AnalyticsStore.addChangeListener(this.onAnalyticsChange);

        if (this.state.message === AnnouncementBarMessages.EMAIL_VERIFIED) {
            setTimeout(() => {
                ErrorStore.storeLastError('');
                ErrorStore.emitChange();
            }, 4000);
        }
    }

    componentWillUnmount() {
        document.body.classList.remove('announcement-bar--fixed');
        ErrorStore.removeChangeListener(this.onErrorChange);
        AnalyticsStore.removeChangeListener(this.onAnalyticsChange);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.isLoggedIn) {
            return;
        }

        const wasFixed = this.shouldRender(prevProps, prevState) && !prevState.allowDismissal;
        const isFixed = this.shouldRender(this.props, this.state) && !this.state.allowDismissal;

        if (!wasFixed && isFixed) {
            document.body.classList.add('announcement-bar--fixed');
        } else if (wasFixed && !isFixed) {
            document.body.classList.remove('announcement-bar--fixed');
        }
    }

    onErrorChange() {
        const newState = this.getState();
        if (newState.message === AnnouncementBarMessages.LICENSE_EXPIRING && !this.state.totalUsers) {
            AdminActions.getStandardAnalytics();
        }

        if (newState.message === AnnouncementBarMessages.EMAIL_VERIFIED) {
            setTimeout(() => {
                ErrorStore.storeLastError('');
                ErrorStore.emitChange();
            }, 4000);
        }
        this.setState(newState);
    }

    onAnalyticsChange() {
        const stats = AnalyticsStore.getAllSystem();
        this.setState({totalUsers: stats[StatTypes.TOTAL_USERS]});
    }

    handleClose(e) {
        if (e) {
            e.preventDefault();
        }

        if (this.state.type === AnnouncementBarTypes.ANNOUNCEMENT) {
            localStorage.setItem(StoragePrefixes.ANNOUNCEMENT + this.state.message, true);
        }

        if (ErrorStore.getLastError() && ErrorStore.getLastError().notification) {
            ErrorStore.clearNotificationError();
        } else {
            ErrorStore.clearLastError();
        }

        this.setState(this.getState());
    }

    shouldRender(props, state) {
        if (!state) {
            return false;
        }

        if (!state.message) {
            return false;
        }

        if (state.message === AnnouncementBarMessages.LICENSE_EXPIRING && !state.totalUsers) {
            return false;
        }

        if (!props.isLoggedIn && state.type === AnnouncementBarTypes.ANNOUNCEMENT) {
            return false;
        }

        return true;
    }

    render() {
        if (!this.shouldRender(this.props, this.state)) {
            return <div/>;
        }

        let barClass = 'announcement-bar';
        let dismissClass = ' announcement-bar--fixed';
        const barStyle = {};
        const linkStyle = {};
        if (this.state.color && this.state.textColor) {
            barStyle.backgroundColor = this.state.color;
            barStyle.color = this.state.textColor;
            linkStyle.color = this.state.textColor;
        } else if (this.state.type === AnnouncementBarTypes.DEVELOPER) {
            barClass = 'announcement-bar announcement-bar-developer';
        } else if (this.state.type === AnnouncementBarTypes.CRITICAL) {
            barClass = 'announcement-bar announcement-bar-critical';
        } else if (this.state.type === AnnouncementBarTypes.SUCCESS) {
            barClass = 'announcement-bar announcement-bar-success';
        }

        let closeButton;
        if (this.state.allowDismissal) {
            dismissClass = '';
            closeButton = (
                <a
                    href='#'
                    className='announcement-bar__close'
                    style={linkStyle}
                    onClick={this.handleClose}
                >
                    {'×'}
                </a>
            );
        }

        const renewalLink = RENEWAL_LINK + '?id=' + this.props.license.id + '&user_count=' + this.state.totalUsers;

        let message = this.state.message;
        if (this.state.type === AnnouncementBarTypes.ANNOUNCEMENT) {
            message = (
                <span
                    dangerouslySetInnerHTML={{__html: TextFormatting.formatText(message, {singleline: true, mentionHighlight: false})}}
                />
            );
        } else if (message === AnnouncementBarMessages.PREVIEW_MODE) {
            message = (
                <FormattedMessage
                    id={AnnouncementBarMessages.PREVIEW_MODE}
                    defaultMessage='Preview Mode: Email notifications have not been configured'
                />
            );
        } else if (message === AnnouncementBarMessages.LICENSE_EXPIRING) {
            message = (
                <FormattedMarkdownMessage
                    id={AnnouncementBarMessages.LICENSE_EXPIRING}
                    defaultMessage='Enterprise license expires on {date, date, long}. [Please renew](!{link}).'
                    values={{
                        date: new Date(parseInt(this.props.license.ExpiresAt, 10)),
                        link: renewalLink,
                    }}
                />
            );
        } else if (message === AnnouncementBarMessages.LICENSE_EXPIRED) {
            message = (
                <FormattedMarkdownMessage
                    id={AnnouncementBarMessages.LICENSE_EXPIRED}
                    defaultMessage='Enterprise license is expired and some features may be disabled. [Please renew](!{link}).'
                    values={{
                        link: renewalLink,
                    }}
                />
            );
        } else if (message === AnnouncementBarMessages.LICENSE_PAST_GRACE) {
            message = (
                <FormattedMessage
                    id={AnnouncementBarMessages.LICENSE_PAST_GRACE}
                    defaultMessage='Enterprise license is expired and some features may be disabled. Please contact your System Administrator for details.'
                />
            );
        } else if (message === AnnouncementBarMessages.WEBSOCKET_PORT_ERROR) {
            message = (
                <FormattedMarkdownMessage
                    id={AnnouncementBarMessages.WEBSOCKET_PORT_ERROR}
                    defaultMessage={'Please check connection, Mattermost unreachable. If issue persists, ask administrator to [check WebSocket port](!https://about.mattermost.com/default-websocket-port-help).'}
                />
            );
        } else if (message === AnnouncementBarMessages.SITE_URL) {
            let id;
            let defaultMessage;
            if (this.props.enableSignUpWithGitLab) {
                id = t('announcement_bar.error.site_url_gitlab');
                defaultMessage = 'Please configure your {docsLink} in the System Console or in gitlab.rb if you\'re using GitLab Mattermost.';
            } else {
                id = t('announcement_bar.error.site_url');
                defaultMessage = 'Please configure your {docsLink} in the System Console.';
            }

            message = (
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
            );
        } else if (message === AnnouncementBarMessages.EMAIL_VERIFICATION_REQUIRED) {
            message = (
                <React.Fragment>
                    <FormattedHTMLMessage
                        id={AnnouncementBarMessages.EMAIL_VERIFICATION_REQUIRED}
                        defaultMessage='Check your email at {email} to verify the address. Cannot find the email?'
                        values={{
                            email: this.props.user.email,
                        }}
                    />
                    {this.createEmailResendLink(this.props.user.email)}
                </React.Fragment>
            );
        } else if (message === AnnouncementBarMessages.EMAIL_VERIFIED) {
            message = (
                <React.Fragment>
                    <span className='fa-wrapper'>
                        <i className='fa fa-check'/>
                    </span>
                    <FormattedHTMLMessage
                        id={AnnouncementBarMessages.EMAIL_VERIFIED}
                        defaultMessage='Email verified'
                    />
                </React.Fragment>
            );
        }

        return (
            <div
                className={barClass + dismissClass}
                style={barStyle}
            >
                <span>{message}</span>
                {closeButton}
            </div>
        );
    }
}
