// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {MessageDescriptor, useIntl} from 'react-intl';

import SaveButton from 'components/save_button';
import Input, {SIZE} from 'components/widgets/inputs/input/input';
import ShieldWithCheckmarkSVG from 'components/common/svg_images_components/shield_with_checkmark';

import Constants from 'utils/constants';

import './login_mfa.scss';

type LoginMfaProps = {
    loginId: string;
    password: string;
    title?: MessageDescriptor;
    subtitle?: MessageDescriptor;
    onSubmit: (loginId: string, password: string, token: string) => void;
}

const LoginMfa = ({loginId, password, title, subtitle, onSubmit}: LoginMfaProps) => {
    const {formatMessage} = useIntl();

    const [token, setToken] = useState('');
    const [saving, setSaving] = useState(false);

    const handleInputOnChange = ({target: {value: token}}: React.ChangeEvent<HTMLInputElement>) => {
        setToken(token.trim().replace(/\s/g, ''));
    };

    const handleSaveButtonOnClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();

        if (!saving) {
            setSaving(true);

            onSubmit(loginId, password, token);
        }
    };

    const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === Constants.KeyCodes.ENTER[0] && token) {
            handleSaveButtonOnClick(e);
        }
    };

    return (
        <div
            className='login-mfa'
            onKeyDown={onEnterKeyDown}
            tabIndex={0}
        >
            <div className='login-mfa-svg'>
                <ShieldWithCheckmarkSVG/>
            </div>
            <h1 className='login-mfa-title'>
                {formatMessage(title || {id: 'login_mfa.title', defaultMessage: 'Enter MFA Token'})}
            </h1>
            <p className='login-mfa-subtitle'>
                {formatMessage(subtitle || {id: 'login_mfa.subtitle', defaultMessage: 'To complete the sign in process, please enter a token from your smartphone\'s authenticator'})}
            </p>
            <div className='login-mfa-form'>
                <Input
                    name='token'
                    containerClassName='login-mfa-form-input'
                    type='text'
                    inputSize={SIZE.LARGE}
                    value={token}
                    onChange={handleInputOnChange}
                    placeholder={formatMessage({id: 'login_mfa.token', defaultMessage: 'Enter MFA Token'})}
                    autoFocus={true}
                    disabled={saving}
                />
                <div className='login-mfa-form-button-container'>
                    <SaveButton
                        extraClasses='login-mfa-form-button-submit large'
                        saving={saving}
                        disabled={!token}
                        onClick={handleSaveButtonOnClick}
                        defaultMessage={formatMessage({id: 'login_mfa.submit', defaultMessage: 'Submit'})}
                        savingMessage={formatMessage({id: 'login_mfa.saving', defaultMessage: 'Logging in…'})}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginMfa;
