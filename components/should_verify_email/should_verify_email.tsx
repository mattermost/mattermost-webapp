// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';
import {useLocation, useHistory} from 'react-router-dom';
import classNames from 'classnames';

import ManWithMailboxSVG from 'components/common/svg_images_components/man_with_mailbox_svg';
import ColumnLayout from 'components/header_footer_route/content_layouts/column';
import SaveButton from 'components/save_button';

import {sendVerificationEmail} from 'mattermost-redux/actions/users';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import './should_verify_email.scss';

const ShouldVerifyEmail = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch<DispatchFunc>();
    const history = useHistory();
    const {search} = useLocation();

    const params = new URLSearchParams(search);
    const email = params.get('email') ?? '';

    const [resendStatus, setResendStatus] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);

    const handleReturnButtonOnClick = useCallback(() => {
        history.push('/');
    }, [history]);

    const handleResendButtonOnClick = async () => {
        if (email) {
            setIsWaiting(true);

            const {error} = await dispatch(sendVerificationEmail(email));

            if (error) {
                setResendStatus('failure');
                setIsWaiting(false);
                return;
            }

            setResendStatus('success');
            setIsWaiting(false);
        }
    };

    return (
        <div className='should-verify-body'>
            <div className='should-verify-body-content'>
                <ColumnLayout
                    title={formatMessage({id: 'email_verify.almost', defaultMessage: 'You’re almost done!'})}
                    message={formatMessage({id: 'email_verify.notVerifiedBody', defaultMessage: 'Please verify your email address. Check your inbox for an email.'})}
                    SVGElement={<ManWithMailboxSVG width={284}/>}
                    extraContent={(
                        <div className='should-verify-body-content-extra'>
                            <div className='should-verify-body-content-buttons'>
                                <SaveButton
                                    extraClasses='should-verify-body-content-button-resend large'
                                    saving={isWaiting}
                                    disabled={!email}
                                    onClick={handleResendButtonOnClick}
                                    defaultMessage={formatMessage({id: 'email_verify.resend', defaultMessage: 'Resend Email'})}
                                    savingMessage={formatMessage({id: 'email_verify.sending', defaultMessage: 'Sending email…'})}
                                />
                                <button
                                    className='should-verify-body-content-button-return'
                                    onClick={handleReturnButtonOnClick}
                                >
                                    {formatMessage({id: 'email_verify.return', defaultMessage: 'Return to log in'})}
                                </button>
                            </div>
                            <div className={classNames('should-verify-body-content-message', resendStatus)}>
                                <i className={classNames('should-verify-body-content-message-icon', 'icon', 'icon-12', resendStatus === 'success' ? 'icon-check' : 'icon-alert-outline')}/>
                                <span className='should-verify-body-content-message-label'>
                                    {resendStatus === 'success' ? (
                                        formatMessage({id: 'email_verify.sent', defaultMessage: 'Verification email sent'})
                                    ) : (
                                        formatMessage({id: 'email_verify.failed', defaultMessage: 'Failed to send verification email'})
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default ShouldVerifyEmail;
