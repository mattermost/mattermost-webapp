// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router';

import {verifyEmail} from 'actions/user_actions.jsx';

import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button.jsx';

import LoadingScreen from './loading_screen.jsx';

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
                            {serverError}
                        </div>
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
