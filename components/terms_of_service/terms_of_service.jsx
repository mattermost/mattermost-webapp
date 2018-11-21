// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {memoizeResult} from 'mattermost-redux/utils/helpers';

import * as GlobalActions from 'actions/global_actions.jsx';
import AnnouncementBar from 'components/announcement_bar';
import LoadingScreen from 'components/loading_screen.jsx';

import {browserHistory} from 'utils/browser_history';
import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants.jsx';

export default class TermsOfService extends React.PureComponent {
    static propTypes = {
        termsEnabled: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            getTermsOfService: PropTypes.func.isRequired,
            updateMyTermsOfServiceStatus: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            customTermsOfServiceId: '',
            customTermsOfServiceText: '',
            loading: true,
            loadingAgree: false,
            loadingDisagree: false,
            serverError: null,
        };

        this.formattedText = memoizeResult((text) => formatText(text));
    }

    componentDidMount() {
        if (this.props.termsEnabled) {
            this.getTermsOfService();
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    getTermsOfService = async () => {
        this.setState({
            customTermsOfServiceId: '',
            customTermsOfServiceText: '',
            loading: true,
        });
        const {data} = await this.props.actions.getTermsOfService();
        if (data) {
            this.setState({
                customTermsOfServiceId: data.id,
                customTermsOfServiceText: data.text,
                loading: false,
            });
        } else {
            GlobalActions.emitUserLoggedOutEvent(`/login?extra=${Constants.GET_TERMS_ERROR}`);
        }
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

    registerUserAction = async (accepted, success) => {
        const {data} = await this.props.actions.updateMyTermsOfServiceStatus(this.state.customTermsOfServiceId, accepted);
        if (data) {
            success(data);
        } else {
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
        }
    };

    render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        let termsMarkdownClasses = 'terms-of-service__markdown';
        if (this.state.serverError) {
            termsMarkdownClasses += ' terms-of-service-error__height--fill';
        } else {
            termsMarkdownClasses += ' terms-of-service__height--fill';
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
                <div>
                    <div className='signup-team__container terms-of-service__container'>
                        <div className={termsMarkdownClasses}>
                            <div className='medium-center'>
                                {messageHtmlToComponent(this.formattedText(this.state.customTermsOfServiceText), false, {mentions: false})}
                            </div>
                        </div>
                        <div className='terms-of-service__footer medium-center'>
                            <ButtonGroup className='terms-of-service__button-group'>
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
                                <div className='terms-of-service__server-error alert alert-warning'>
                                    <i
                                        className='fa fa-exclamation-triangle'
                                        title={Utils.localizeMessage('generic_icons.warning', 'Warning Icon')}
                                    />
                                    {' '}
                                    {this.state.serverError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
