// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as AdminActions from 'actions/admin_actions.jsx';
import AnalyticsStore from 'stores/analytics_store.jsx';
import ErrorStore from 'stores/error_store.jsx';

import {ErrorBarTypes, StatTypes, StoragePrefixes} from 'utils/constants.jsx';
import {displayExpiryDate, isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod} from 'utils/license_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';

const RENEWAL_LINK = 'https://licensing.mattermost.com/renew';

const BAR_DEVELOPER_TYPE = 'developer';
const BAR_CRITICAL_TYPE = 'critical';
const BAR_ANNOUNCEMENT_TYPE = 'announcement';

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
        licenseId: PropTypes.string,
        siteURL: PropTypes.string,
        sendEmailNotifications: PropTypes.bool.isRequired,
        bannerText: PropTypes.string,
        allowBannerDismissal: PropTypes.bool.isRequired,
        enableBanner: PropTypes.bool.isRequired,
        bannerColor: PropTypes.string,
        bannerTextColor: PropTypes.string,
        enableSignUpWithGitLab: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.onErrorChange = this.onErrorChange.bind(this);
        this.onAnalyticsChange = this.onAnalyticsChange.bind(this);
        this.handleClose = this.handleClose.bind(this);

        ErrorStore.clearLastError(true);

        this.setInitialError();

        this.state = this.getState();
    }

    setInitialError = () => {
        const errorIgnored = ErrorStore.getIgnoreNotification();

        if (!errorIgnored) {
            if (this.props.canViewSystemErrors && this.props.siteURL === '') {
                ErrorStore.storeLastError({notification: true, message: ErrorBarTypes.SITE_URL});
                return;
            } else if (!this.props.sendEmailNotifications) {
                ErrorStore.storeLastError({notification: true, message: ErrorBarTypes.PREVIEW_MODE});
                return;
            }
        }

        if (isLicensePastGracePeriod()) {
            if (this.props.canViewSystemErrors) {
                ErrorStore.storeLastError({notification: true, message: ErrorBarTypes.LICENSE_EXPIRED, type: BAR_CRITICAL_TYPE});
            } else {
                ErrorStore.storeLastError({notification: true, message: ErrorBarTypes.LICENSE_PAST_GRACE, type: BAR_CRITICAL_TYPE});
            }
        } else if (isLicenseExpired() && this.props.canViewSystemErrors) {
            ErrorStore.storeLastError({notification: true, message: ErrorBarTypes.LICENSE_EXPIRED, type: BAR_CRITICAL_TYPE});
        } else if (isLicenseExpiring() && this.props.canViewSystemErrors) {
            ErrorStore.storeLastError({notification: true, message: ErrorBarTypes.LICENSE_EXPIRING, type: BAR_CRITICAL_TYPE});
        }
    }

    getState() {
        const error = ErrorStore.getLastError();
        if (error && error.message) {
            return {message: error.message, color: null, textColor: null, type: error.type, allowDismissal: true};
        }

        const bannerText = this.props.bannerText || '';
        const allowDismissal = this.props.allowBannerDismissal;
        const bannerDismissed = localStorage.getItem(StoragePrefixes.ANNOUNCEMENT + this.props.bannerText);

        if (this.props.enableBanner &&
            bannerText.length > 0 &&
            (!bannerDismissed || !allowDismissal)
        ) {
            // Remove old local storage items
            Utils.removePrefixFromLocalStorage(StoragePrefixes.ANNOUNCEMENT);
            return {
                message: bannerText,
                color: this.props.bannerColor,
                textColor: this.props.bannerTextColor,
                type: BAR_ANNOUNCEMENT_TYPE,
                allowDismissal,
            };
        }

        return {message: null, color: null, colorText: null, textColor: null, type: null, allowDismissal: true};
    }

    isValidState(s) {
        if (!s) {
            return false;
        }

        if (!s.message) {
            return false;
        }

        if (s.message === ErrorBarTypes.LICENSE_EXPIRING && !this.state.totalUsers) {
            return false;
        }

        return true;
    }

    componentDidMount() {
        if (this.props.isLoggedIn && !this.state.allowDismissal) {
            document.body.classList.add('error-bar--fixed');
        }

        ErrorStore.addChangeListener(this.onErrorChange);
        AnalyticsStore.addChangeListener(this.onAnalyticsChange);
    }

    componentWillUnmount() {
        document.body.classList.remove('error-bar--fixed');
        ErrorStore.removeChangeListener(this.onErrorChange);
        AnalyticsStore.removeChangeListener(this.onAnalyticsChange);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.isLoggedIn) {
            return;
        }

        if (!prevState.allowDismissal && this.state.allowDismissal) {
            document.body.classList.remove('error-bar--fixed');
        } else if (prevState.allowDismissal && !this.state.allowDismissal) {
            document.body.classList.add('error-bar--fixed');
        }
    }

    onErrorChange() {
        const newState = this.getState();
        if (newState.message === ErrorBarTypes.LICENSE_EXPIRING && !this.state.totalUsers) {
            AdminActions.getStandardAnalytics();
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

        if (this.state.type === BAR_ANNOUNCEMENT_TYPE) {
            localStorage.setItem(StoragePrefixes.ANNOUNCEMENT + this.state.message, true);
        }

        if (ErrorStore.getLastError() && ErrorStore.getLastError().notification) {
            ErrorStore.clearNotificationError();
        } else {
            ErrorStore.clearLastError();
        }

        this.setState(this.getState());
    }

    render() {
        if (!this.isValidState(this.state)) {
            return <div/>;
        }

        if (!this.props.isLoggedIn && this.state.type === BAR_ANNOUNCEMENT_TYPE) {
            return <div/>;
        }

        let errClass = 'error-bar';
        let dismissClass = ' error-bar--fixed';
        const barStyle = {};
        const linkStyle = {};
        if (this.state.color && this.state.textColor) {
            barStyle.backgroundColor = this.state.color;
            barStyle.color = this.state.textColor;
            linkStyle.color = this.state.textColor;
        } else if (this.state.type === BAR_DEVELOPER_TYPE) {
            errClass = 'error-bar error-bar-developer';
        } else if (this.state.type === BAR_CRITICAL_TYPE) {
            errClass = 'error-bar error-bar-critical';
        }

        let closeButton;
        if (this.state.allowDismissal) {
            dismissClass = '';
            closeButton = (
                <a
                    href='#'
                    className='error-bar__close'
                    style={linkStyle}
                    onClick={this.handleClose}
                >
                    {'×'}
                </a>
            );
        }

        const renewalLink = RENEWAL_LINK + '?id=' + this.props.licenseId + '&user_count=' + this.state.totalUsers;

        let message = this.state.message;
        if (this.state.type === BAR_ANNOUNCEMENT_TYPE) {
            message = (
                <span
                    dangerouslySetInnerHTML={{__html: TextFormatting.formatText(message, {singleline: true, mentionHighlight: false})}}
                />
            );
        } else if (message === ErrorBarTypes.PREVIEW_MODE) {
            message = (
                <FormattedMessage
                    id={ErrorBarTypes.PREVIEW_MODE}
                    defaultMessage='Preview Mode: Email notifications have not been configured'
                />
            );
        } else if (message === ErrorBarTypes.LICENSE_EXPIRING) {
            message = (
                <FormattedHTMLMessage
                    id={ErrorBarTypes.LICENSE_EXPIRING}
                    defaultMessage='Enterprise license expires on {date}. <a href="{link}" target="_blank">Please renew</a>.'
                    values={{
                        date: displayExpiryDate(),
                        link: renewalLink,
                    }}
                />
            );
        } else if (message === ErrorBarTypes.LICENSE_EXPIRED) {
            message = (
                <FormattedHTMLMessage
                    id={ErrorBarTypes.LICENSE_EXPIRED}
                    defaultMessage='Enterprise license is expired and some features may be disabled. <a href="{link}" target="_blank">Please renew</a>.'
                    values={{
                        link: renewalLink,
                    }}
                />
            );
        } else if (message === ErrorBarTypes.LICENSE_PAST_GRACE) {
            message = (
                <FormattedMessage
                    id={ErrorBarTypes.LICENSE_PAST_GRACE}
                    defaultMessage='Enterprise license is expired and some features may be disabled. Please contact your System Administrator for details.'
                />
            );
        } else if (message === ErrorBarTypes.WEBSOCKET_PORT_ERROR) {
            message = (
                <FormattedHTMLMessage
                    id={ErrorBarTypes.WEBSOCKET_PORT_ERROR}
                    defaultMessage='Please check connection, Mattermost unreachable. If issue persists, ask administrator to <a href="https://about.mattermost.com/default-websocket-port-help" target="_blank">check WebSocket port</a>.'
                />
            );
        } else if (message === ErrorBarTypes.SITE_URL) {
            let id;
            let defaultMessage;
            if (this.props.enableSignUpWithGitLab) {
                id = 'error_bar.site_url_gitlab';
                defaultMessage = 'Please configure your {docsLink} in the System Console or in gitlab.rb if you\'re using GitLab Mattermost.';
            } else {
                id = 'error_bar.site_url';
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
                                    id='error_bar.site_url.docsLink'
                                    defaultMessage='Site URL'
                                />
                            </a>
                        ),
                        link: (
                            <Link to='/admin_console/general/configuration'>
                                <FormattedMessage
                                    id='error_bar.site_url.link'
                                    defaultMessage='the System Console'
                                />
                            </Link>
                        ),
                    }}
                />
            );
        }

        return (
            <div
                className={errClass + dismissClass}
                style={barStyle}
            >
                <span>{message}</span>
                {closeButton}
            </div>
        );
    }
}
