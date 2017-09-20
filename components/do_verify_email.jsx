// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import LoadingScreen from './loading_screen.jsx';
import BackButton from 'components/common/back_button.jsx';

import {verifyEmail} from 'actions/user_actions.jsx';

import React from 'react';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router/es6';
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
                this.setState({verifyStatus: 'failure', serverError: err.message});
            }
        );
    }
    render() {
        if (this.state.verifyStatus !== 'failure') {
            return (<LoadingScreen/>);
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <h3>
                            <FormattedMessage
                                id='email_verify.almost'
                                defaultMessage='{siteName}: You are almost done'
                                values={{
                                    siteName: global.window.mm_config.SiteName
                                }}
                            />
                        </h3>
                        <div>
                            <p>
                                <FormattedMessage id='email_verify.verifyFailed'/>
                            </p>
                            <p className='alert alert-danger'>
                                <i className='fa fa-times'/>
                                {this.state.serverError}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DoVerifyEmail.defaultProps = {
};
DoVerifyEmail.propTypes = {
    location: PropTypes.object.isRequired
};
