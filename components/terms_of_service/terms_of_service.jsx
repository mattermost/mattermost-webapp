// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {memoizeResult} from 'mattermost-redux/utils/helpers';

import * as GlobalActions from 'actions/global_actions.jsx';
import {getServiceTerms, updateServiceTermsStatus} from 'actions/user_actions.jsx';

import AnnouncementBar from 'components/announcement_bar';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import {browserHistory} from 'utils/browser_history';
import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants.jsx';

export default class TermsOfService extends React.PureComponent {
    static propTypes = {
        customServiceTermsId: PropTypes.string.isRequired,
        privacyPolicyLink: PropTypes.string,
        siteName: PropTypes.string,
        termsEnabled: PropTypes.bool,
        termsOfServiceLink: PropTypes.string,
    };

    static defaultProps = {
        privacyPolicyLink: 'https://about.mattermost.com/default-privacy-policy/',
        siteName: 'Mattermost',
        termsEnabled: true,
        termsOfServiceLink: 'https://about.mattermost.com/default-terms/',
    };

    constructor(props) {
        super(props);

        this.state = {
            customServiceTermsId: '',
            customServiceTermsText: '',
            loading: true,
            loadingAgree: false,
            loadingDisagree: false,
            serverError: null,
        };

        this.formattedText = memoizeResult((text) => formatText(text));
    }

    componentDidMount() {
        if (this.props.termsEnabled) {
            this.getServiceTerms();
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    getServiceTerms = () => {
        this.setState({
            customServiceTermsId: '',
            customServiceTermsText: '',
            loading: true,
        });
        getServiceTerms(
            (data) => {
                this.setState({
                    customServiceTermsId: data.id,
                    customServiceTermsText: data.text,
                    loading: false,
                });
            },
            () => {
                GlobalActions.emitUserLoggedOutEvent(`/login?extra=${Constants.GET_TERMS_ERROR}`);
            }
        );
    };

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
            true,
            () => {
                const query = new URLSearchParams(this.props.location.search);
                const redirectTo = query.get('redirect_to');
                if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
                    browserHistory.push(redirectTo);
                } else {
                    GlobalActions.redirectUserToDefaultTeam();
                }
            }
        );
    };

    handleRejectTerms = () => {
        this.setState({
            loadingDisagree: true,
            serverError: null,
        });
        this.registerUserAction(
            false,
            () => {
                GlobalActions.emitUserLoggedOutEvent(`/login?extra=${Constants.TERMS_REJECTED}`);
            }
        );
    };

    registerUserAction = (accepted, success) => {
        updateServiceTermsStatus(
            this.state.customServiceTermsId,
            accepted,
            success,
            () => {
                this.setState({
                    loadingAgree: false,
                    loadingDisagree: false,
                    serverError: (
                        <FormattedMessage
                            id='terms_of_service.api_error'
                            defaultMessage='Unable to complete the request. If this issue persists, contact your System Administrator.'
                        />
                    ),
                });
            },
        );
    };

    render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

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
                        <FormattedMessage
                            id='web.header.logout'
                            defaultMessage='Logout'
                        />
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
                        <div className='signup__markdown min-height--fill'>
                            {messageHtmlToComponent(this.formattedText(this.state.customServiceTermsText), false, {mentions: false})}
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
                                    siteName: this.props.siteName,
                                    TermsOfServiceLink: this.props.termsOfServiceLink,
                                    PrivacyPolicyLink: this.props.privacyPolicyLink,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
