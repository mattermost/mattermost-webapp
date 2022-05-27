// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {oauthToEmail} from 'actions/admin_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import {t} from 'utils/i18n.jsx';
import LocalizedInput from 'components/localized_input/localized_input';
import {getPasswordConfig} from 'utils/utils';

type Props = {
    currentType: string;
    email: string;
    siteName: string;
    passwordConfig: ReturnType<typeof getPasswordConfig>;
}

const OAuthToEmail = (props: Props) => {
    const passwordInput = useRef<HTMLInputElement>(null);
    const passwordConfirmInput = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | JSX.Element | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const password = passwordInput.current?.value;
        if (!password) {
            setError(Utils.localizeMessage('claim.oauth_to_email.enterPwd', 'Please enter a password.'));
            return;
        }

        const {valid, error} = Utils.isValidPassword(password, props.passwordConfig);
        if (!valid && error) {
            setError(error);
            return;
        }

        const confirmPassword = passwordConfirmInput.current?.value;
        if (!confirmPassword || password !== confirmPassword) {
            setError(Utils.localizeMessage('claim.oauth_to_email.pwdNotMatch', 'Passwords do not match.'));
            return;
        }

        setError(null);

        oauthToEmail(
            props.currentType,
            props.email,
            password,
            (data) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err) => {
                setError(err.message);
            },
        );
    };
    let errorElement = null;
    if (error) {
        errorElement = <div className='form-group has-error'><label className='control-label'>{error}</label></div>;
    }

    const formClass = classNames('form-group', {' has-error': errorElement});

    const uiType = `${(props.currentType === Constants.SAML_SERVICE ? Constants.SAML_SERVICE.toUpperCase() : Utils.toTitleCase(props.currentType))} SSO`;

    return (
        <div>
            <h3>
                <FormattedMessage
                    id='claim.oauth_to_email.title'
                    defaultMessage='Switch {type} Account to Email'
                    values={{
                        type: uiType,
                    }}
                />
            </h3>
            <form onSubmit={submit}>
                <p>
                    <FormattedMessage
                        id='claim.oauth_to_email.description'
                        defaultMessage='Upon changing your account type, you will only be able to login with your email and password.'
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='claim.oauth_to_email.enterNewPwd'
                        defaultMessage='Enter a new password for your {site} email account'
                        values={{
                            site: props.siteName,
                        }}
                    />
                </p>
                <div className={formClass}>
                    <LocalizedInput
                        type='password'
                        className='form-control'
                        name='password'
                        ref={passwordInput}
                        placeholder={{id: t('claim.oauth_to_email.newPwd'), defaultMessage: 'New Password'}}
                        spellCheck='false'
                    />
                </div>
                <div className={formClass}>
                    <LocalizedInput
                        type='password'
                        className='form-control'
                        name='passwordconfirm'
                        ref={passwordConfirmInput}
                        placeholder={{id: t('claim.oauth_to_email.confirm'), defaultMessage: 'Confirm Password'}}
                        spellCheck='false'
                    />
                </div>
                {errorElement}
                <button
                    type='submit'
                    className='btn btn-primary'
                >
                    <FormattedMessage
                        id='claim.oauth_to_email.switchTo'
                        defaultMessage='Switch {type} to Email and Password'
                        values={{
                            type: uiType,
                        }}
                    />
                </button>
            </form>
        </div>
    );
};

export default OAuthToEmail;
