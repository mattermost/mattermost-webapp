// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {resendVerification} from 'actions/user_actions.jsx';
import BackButton from 'components/common/back_button.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export default class ShouldVerifyEmail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            resendStatus: 'none',
        };
    }

    handleResend = () => {
        const email = (new URLSearchParams(this.props.location.search)).get('email');

        this.setState({resendStatus: 'sending'});

        resendVerification(
            email,
            () => {
                this.setState({resendStatus: 'success'});
            },
            () => {
                this.setState({resendStatus: 'failure'});
            }
        );
    }
    render() {
        let resendConfirm = '';
        if (this.state.resendStatus === 'success') {
            resendConfirm = (
                <div>
                    <br/>
                    <p className='alert alert-success'>
                        <i
                            className='fa fa-check'
                            title={localizeMessage('generic_icons.success', 'Success Icon')}
                        />
                        <FormattedMessage
                            id='email_verify.sent'
                            defaultMessage=' Verification email sent.'
                        />
                    </p>
                </div>
            );
        }

        if (this.state.resendStatus === 'failure') {
            resendConfirm = (
                <div>
                    <br/>
                    <p className='alert alert-danger'>
                        <i
                            className='fa fa-times'
                            title={localizeMessage('generic_icons.fail', 'Faliure Icon')}
                        />
                        <FormattedMessage id='email_verify.failed'/>
                    </p>
                </div>
            );
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
                                    siteName: this.props.siteName,
                                }}
                            />
                        </h3>
                        <div>
                            <p>
                                <FormattedMessage
                                    id='email_verify.notVerifiedBody'
                                    defaultMessage='Please verify your email address. Check your inbox for an email.'
                                />
                            </p>
                            <button
                                onClick={this.handleResend}
                                className='btn btn-primary'
                            >
                                <FormattedMessage
                                    id='email_verify.resend'
                                    defaultMessage='Resend Email'
                                />
                            </button>
                            {resendConfirm}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ShouldVerifyEmail.propTypes = {
    location: PropTypes.object.isRequired,
    siteName: PropTypes.string,
};
