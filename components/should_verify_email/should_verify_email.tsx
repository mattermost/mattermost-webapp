// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

import BackButton from 'components/common/back_button';
import LocalizedIcon from 'components/localized_icon';
import SuccessIcon from 'components/widgets/icons/fa_success_icon';

import {t} from 'utils/i18n';

type Props = {
    location: {
        search: string;
    };
    siteName?: string;
    actions: {
        sendVerificationEmail: (email: string) => Promise<{
            data: boolean;
            error?: {
                err: string;
            };
        }>;
    };
}

type State = {
    resendStatus: string;
}

export default class ShouldVerifyEmail extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            resendStatus: 'none',
        };
    }

    public handleResend = async (): Promise<void> => {
        const email = (new URLSearchParams(this.props.location.search)).get('email');

        if (email) {
            this.setState({resendStatus: 'sending'});

            const {data, error} = await this.props.actions.sendVerificationEmail(email);

            if (data) {
                this.setState({resendStatus: 'success'});
            } else if (error) {
                this.setState({resendStatus: 'failure'});
            }
        }
    }

    public render(): JSX.Element {
        let resendConfirm: ReactNode = '';

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
                        <LocalizedIcon
                            className='fa fa-times'
                            title={{id: t('generic_icons.fail'), defaultMessage: 'Failure Icon'}}
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
