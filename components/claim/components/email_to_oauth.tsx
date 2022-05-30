// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useRef} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {AuthChangeResponse} from '@mattermost/types/users';

import {emailToOAuth} from 'actions/admin_actions.jsx';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import {t} from 'utils/i18n.jsx';

import LoginMfa from 'components/login/login_mfa';
import LocalizedInput from 'components/localized_input/localized_input';

type Props = {
    newType: string | null;
    email: string | null;
    siteName?: string;
}

const EmailToOAuth = (props: Props) => {
    const [showMfa, setShowMfa] = useState(false);
    const [password, setPassword] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const preSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const password = passwordInput.current?.value;
        if (!password) {
            setServerError(Utils.localizeMessage('claim.email_to_oauth.pwdError', 'Please enter your password.'));
            return;
        }

        setPassword(password);

        setServerError(null);

        submit(props.email, password, '');
    };

    const submit = (loginId: string | null, password: string, token: string) => {
        emailToOAuth(
            loginId,
            password,
            token,
            props.newType,
            (data: AuthChangeResponse) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err: {server_error_id: string; message: string}) => {
                if (!showMfa && err.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    setShowMfa(true);
                } else {
                    setServerError(err.message);
                    setShowMfa(false);
                }
            },
        );
    };

    const error = serverError ? <div className='form-group has-error'><label className='control-label'>{serverError}</label></div> : null;

    const formClass = classNames('form-group', {' has-error': error});

    const type = (props.newType === Constants.SAML_SERVICE ? Constants.SAML_SERVICE.toUpperCase() : Utils.toTitleCase(props.newType || ''));
    const uiType = `${type} SSO`;

    let content;
    if (showMfa) {
        content = (
            <LoginMfa
                loginId={props.email}
                password={password}
                title={{
                    id: t('claim.email_to_oauth.title'),
                    defaultMessage: 'Switch Email/Password Account to {uiType}',
                }}
                onSubmit={submit}
            />
        );
    } else {
        content = (
            <>
                <h3>
                    <FormattedMessage
                        id='claim.email_to_oauth.title'
                        defaultMessage='Switch Email/Password Account to {uiType}'
                        values={{
                            uiType,
                        }}
                    />
                </h3>
                <form onSubmit={preSubmit}>
                    <p>
                        <FormattedMessage
                            id='claim.email_to_oauth.ssoType'
                            defaultMessage='Upon claiming your account, you will only be able to login with {type} SSO'
                            values={{
                                type,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.email_to_oauth.ssoNote'
                            defaultMessage='You must already have a valid {type} account'
                            values={{
                                type,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.email_to_oauth.enterPwd'
                            defaultMessage='Enter the password for your {site} account'
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
                            placeholder={{id: t('claim.email_to_oauth.pwd'), defaultMessage: 'Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {error}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.email_to_oauth.switchTo'
                            defaultMessage='Switch Account to {uiType}'
                            values={{
                                uiType,
                            }}
                        />
                    </button>
                </form>
            </>
        );
    }

    return (
        <div>
            {content}
        </div>
    );
};

export default EmailToOAuth;

