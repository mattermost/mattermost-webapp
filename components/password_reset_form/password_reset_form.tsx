// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ServerError} from 'mattermost-redux/types/errors';
import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n.jsx';
interface Props {
  location: {search: string};
  siteName?: string;
  actions: {
    resetUserPassword: (token: string, newPassword: string) => any;
  };
}

interface State {
    error: React.ReactNode;
}

export default class PasswordResetForm extends React.PureComponent<Props, State> {
    public passwordInput: React.RefObject<HTMLInputElement>; //Public because it is used by tests
    public constructor(props: Props) {
      super(props);
      this.passwordInput = React.createRef<HTMLInputElement>();
      this.state = { error: null };
    }

     handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        const password = this.passwordInput.current!.value;
        if (!password || password.length < Constants.MIN_PASSWORD_LENGTH) {
            this.setState({
                error: (
                    <FormattedMessage
                        id='password_form.error'
                        defaultMessage='Please enter at least {chars} characters.'
                        values={{
                            chars: Constants.MIN_PASSWORD_LENGTH,
                        }}
                    />
                ),
            });
            return;
        }

        this.setState({error: null});

        const token = (new URLSearchParams(this.props.location.search)).get('token');
        const {data, error} = await this.props.actions.resetUserPassword(token, password);
        if (data) {
            browserHistory.push('/login?extra=' + Constants.PASSWORD_CHANGE);
            this.setState({error: null});
        } else if (error) {
            this.setState({error: error.message});
        }
    }

    render() {
        let error = null;
        if (this.state.error) {
            error = (
                <div className='form-group has-error'>
                    <label className='control-label'>
                        {this.state.error}
                    </label>
                </div>
            );
        }

        let formClass = 'form-group';
        if (error) {
            formClass += ' has-error';
        }

        return (
            <div className='col-sm-12'>
                <div className='signup-team__container'>
                    <h3>
                        <FormattedMessage
                            id='password_form.title'
                            defaultMessage='Password Reset'
                        />
                    </h3>
                    <form onSubmit={this.handlePasswordReset}>
                        <p>
                            <FormattedMessage
                                id='password_form.enter'
                                defaultMessage='Enter a new password for your {siteName} account.'
                                values={{
                                    siteName: this.props.siteName,
                                }}
                            />
                        </p>
                        <div className={formClass}>
                            <LocalizedInput
                                id='resetPasswordInput'
                                type='password'
                                className='form-control'
                                name='password'
                                ref={this.passwordInput}
                                placeholder={{id: t('password_form.pwd'), defaultMessage: 'Password'}}
                                spellCheck='false'
                                autoFocus={true}
                            />
                        </div>
                        {error}
                        <button
                            id='resetPasswordButton'
                            type='submit'
                            className='btn btn-primary'
                        >
                            <FormattedMessage
                                id='password_form.change'
                                defaultMessage='Change my password'
                            />
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}
