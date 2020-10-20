// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import BackButton from 'components/common/back_button';
import SuccessIcon from 'components/widgets/icons/fa_success_icon';

export default class ShouldVerifyEmail extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
        siteName: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            sendVerificationEmail: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            resendStatus: 'none',
        };
    }

    handleResend = async () => {
        const email = (new URLSearchParams(this.props.location.search)).get('email');

        this.setState({resendStatus: 'sending'});

        const {data, error} = await this.props.actions.sendVerificationEmail(email);
        if (data) {
            this.setState({resendStatus: 'success'});
        } else if (error) {
            this.setState({resendStatus: 'failure'});
        }
    }

    render() {
        let resendConfirm = '';

        if (this.state.resendStatus === 'success') {
            resendConfirm = (
                <div>
                    <br/>
                    <p
                        data-testid='emailVerifySentMessage'
                        className='alert alert-success'
                    >
                        <SuccessIcon/>
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
                        <FormattedMessage
                            id='generic_icons.fail'
                            defaultMessage='Faliure Icon'
                        >
                            {(title) => (
                                <i
                                    className='fa fa-times'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
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
                        <h3 data-testid='emailVerifyAlmost'>
                            <FormattedMessage
                                id='email_verify.almost'
                                defaultMessage='{siteName}: You are almost done'
                                values={{
                                    siteName: this.props.siteName,
                                }}
                            />
                        </h3>
                        <div>
                            <p data-testid='emailVerifyNotVerifiedBody'>
                                <FormattedMessage
                                    id='email_verify.notVerifiedBody'
                                    defaultMessage='Please verify your email address. Check your inbox for an email.'
                                />
                            </p>
                            <button
                                data-testid='emailVerifyResend'
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
