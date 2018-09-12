// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {memoizeResult} from 'mattermost-redux/utils/helpers';

import * as GlobalActions from 'actions/global_actions.jsx';
import {updateServiceTermsStatus} from 'actions/user_actions.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import AnnouncementBar from 'components/announcement_bar';

import {browserHistory} from 'utils/browser_history';
import messageHtmlToComponent from 'utils/message_html_to_component';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants.jsx';

export default class TermsOfService extends React.PureComponent {
    static propTypes = {

        /*
         * Mattermost configuration
         */
        config: PropTypes.object,

        /*
         * Whether the terms feature is enabled
         */
        termsEnabled: PropTypes.bool,
    };

    static defaultProps = {
        config: {
            AboutLink: 'https://about.mattermost.com/default-about/',
            PrivacyPolicyLink: 'https://about.mattermost.com/default-privacy-policy/',
            SiteName: 'Mattermost',
            CustomServiceTermsText: '',
        },
        termsEnabled: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            loadingAgree: false,
            loadingDisagree: false,
            serverError: null,
        };

        this.formattedText = memoizeResult((CustomServiceTermsText) => {
            return TextFormatting.formatText(CustomServiceTermsText);
        });
    }

    componentDidMount() {
        if (!this.props.termsEnabled) {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    handleLogoutClick = (e) => {
        e.preventDefault();
        GlobalActions.emitUserLoggedOutEvent('/login');
    };

    handleAcceptTerms = () => {
        this.setState({
            loadingAgree: true,
            serverError: null,
        });
        this.registerUserAction(
            'true',
            () => {
                const query = new URLSearchParams(this.props.location.search);
                const redirectTo = query.get('redirect_to');
                const redirectAction = query.get('redirect_action');
                if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
                    browserHistory.push(redirectTo);
                }
                if (redirectAction === Constants.DEFAULT_TEAM_REDIRECT) {
                    GlobalActions.redirectUserToDefaultTeam();
                }

                // Default action if redirectTo and redirectAction is not provided.
                // This occurs when user directly opens '/terms_of_service'
                if (!redirectTo && !redirectAction) {
                    GlobalActions.redirectUserToDefaultTeam();
                }
                this.setState({
                    loadingAgree: false,
                });
            }
        );
    };

    handleRejectTerms = () => {
        this.setState({
            loadingDisagree: true,
            serverError: null,
        });
        this.registerUserAction(
            'false',
            () => {
                GlobalActions.emitUserLoggedOutEvent(`/login?extra=${Constants.TERMS_REJECTED}`);
                this.setState({
                    loadingDisagree: false,
                });
            }
        );
    };

    registerUserAction = (accepted, success) => {
        updateServiceTermsStatus(
            this.props.config.CustomServiceTermsId,
            accepted,
            success,
            (err) => {
                this.setState({
                    loadingAgree: false,
                    loadingDisagree: false,
                    serverError: err.message || (
                        <FormattedMessage
                            id='terms_of_service.api_error'
                            defaultMessage='Unable to complete the request. If this issue persists, contact your System Administrator.'
                        />
                    ),
                });
            }
        );
    }

    render() {
        return (
            <div>
                <AnnouncementBar/>
                <div className='signup-header'>
                    <a
                        href='#'
                        onClick={this.handleLogoutClick}
                    >
                        <span
                            className='fa fa-chevron-left'
                            title={Utils.localizeMessage('generic_icons.logout', 'Logout Icon')}
                        />
                        <FormattedMessage id='web.header.logout'/>
                    </a>
                </div>
                <div className='col-sm-12'>
                    <div className='signup-team__container padding--less max-width--more'>
                        <div>
                            <h2>
                                <FormattedMessage
                                    id='terms_of_service.title'
                                    defaultMessage={'Terms of Service'}
                                />
                            </h2>
                        </div>
                        <div className='signup__markdown'>
                            {messageHtmlToComponent(this.formattedText(this.props.config.CustomServiceTermsText), false, {mentions: false})}
                        </div>
                        <div className='margin--extra'>
                            <ButtonGroup>
                                <Button
                                    bsStyle={'primary'}
                                    disabled={this.state.loadingAgree || this.state.loadingDisagree}
                                    id='acceptTerms'
                                    onClick={this.handleAcceptTerms}
                                    type='submit'
                                >
                                    {this.state.loadingAgree && (
                                        <span
                                            className='fa fa-refresh icon--rotate'
                                            title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                                        />
                                    )}
                                    <FormattedMessage
                                        id='terms_of_service.agreeButton'
                                        defaultMessage={'I Agree'}
                                    />
                                </Button>
                                <Button
                                    bsStyle={'link'}
                                    disabled={this.state.loadingAgree || this.state.loadingDisagree}
                                    id='rejectTerms'
                                    onClick={this.handleRejectTerms}
                                    type='reset'
                                >
                                    {this.state.loadingDisagree && (
                                        <span
                                            className='fa fa-refresh icon--rotate'
                                            title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                                        />
                                    )}
                                    <FormattedMessage
                                        id='terms_of_service.disagreeButton'
                                        defaultMessage={'I Disagree'}
                                    />
                                </Button>
                            </ButtonGroup>
                            {Boolean(this.state.serverError) && (
                                <div className='alert alert-warning margin--extra hidden-xs'>
                                    <i
                                        className='fa fa-exclamation-triangle'
                                        title={Utils.localizeMessage('generic_icons.warning', 'Warning Icon')}
                                    />
                                    {' '}
                                    {this.state.serverError}
                                </div>
                            )}
                        </div>
                        <div className='margin--extra'>
                            <FormattedMarkdownMessage
                                id='terms_of_service.footnote'
                                defaultMessage={'By choosing \'I Agree\', you understand and agree to [Terms of Service]({TermsOfServiceLink}) and [Privacy Policy]({PrivacyPolicyLink}). If you do not agree, you cannot access {siteName}.'}
                                values={{
                                    siteName: this.props.config.SiteName,
                                    TermsOfServiceLink: this.props.config.AboutLink,
                                    PrivacyPolicyLink: this.props.config.PrivacyPolicyLink,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
