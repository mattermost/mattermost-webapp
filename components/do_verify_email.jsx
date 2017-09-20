// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import LoadingScreen from './loading_screen.jsx';
import BackButton from 'components/common/back_button.jsx';
import logoImage from 'images/logo.png';

import {verifyEmail} from 'actions/user_actions.jsx';

import React from 'react';
import PropTypes from 'prop-types';
import {browserHistory, Link} from 'react-router/es6';
import {FormattedMessage} from 'react-intl';

export default class DoVerifyEmail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            verifyStatus: 'pending',
            serverError: ''
        };
    }

    componentWillMount() {
        verifyEmail(
            this.props.location.query.token,
            () => {
                browserHistory.push('/login?extra=verified&email=' + encodeURIComponent(this.props.location.query.email));
            },
            (err) => {
                let serverError;
                if (err) {
                    serverError = (
                        <FormattedMessage
                            id='signup_user_completed.invalid_invite'
                            defaultMessage='The invite link was invalid.  Please speak with your Administrator to receive an invitation.'
                        />
                    );
                }

                this.setState({
                    verifyStatus: 'failure',
                    serverError
                });
            }
        );
    }

    render() {
        if (this.state.verifyStatus !== 'failure') {
            return (<LoadingScreen/>);
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div className='signup__content'>
                            <h1>{global.window.mm_config.SiteName}</h1>
                            <h4 className='color--light'>
                                <FormattedMessage
                                    id='web.root.signup_info'
                                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                                />
                            </h4>
                            <div className='margin--extra'>
                                <h5>
                                    <strong>
                                        <FormattedMessage
                                            id='signup.title'
                                            defaultMessage='Create an account with:'
                                        />
                                    </strong>
                                </h5>
                            </div>
                            {serverError}
                        </div>
                        <span className='color--light'>
                            <FormattedMessage
                                id='signup_user_completed.haveAccount'
                                defaultMessage='Already have an account?'
                            />
                            {' '}
                            <Link
                                to={'/login'}
                                query={this.props.location.query}
                            >
                                <FormattedMessage
                                    id='signup_user_completed.signIn'
                                    defaultMessage='Click here to sign in.'
                                />
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

DoVerifyEmail.defaultProps = {
    location: {}
};

DoVerifyEmail.propTypes = {
    location: PropTypes.object.isRequired
};
