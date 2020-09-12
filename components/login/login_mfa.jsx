// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';
import SaveButton from 'components/save_button';
import LocalizedInput from 'components/localized_input/localized_input';

export default class LoginMfa extends React.PureComponent {
    static propTypes = {

        /*
         * User's login ID
         */
        loginId: PropTypes.string.isRequired,

        /*
         * User's password
         */
        password: PropTypes.string.isRequired,

        /*
         * Function to call when submitting user credentials
         */
        submit: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            saving: false,
            token: '',
            serverError: '',
        };
    }

    handleChange = (e) => {
        e.preventDefault();
        const token = e.target.value.trim().replace(/\s/g, '');

        if (token !== this.state.token) {
            this.setState({
                token,
            });
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const state = {};

        state.serverError = '';
        state.saving = true;
        this.setState(state);

        this.props.submit(
            this.props.loginId.toLowerCase(),
            this.props.password,
            this.state.token,
        );
    }

    render() {
        let serverError;
        let errorClass = '';
        if (this.state.serverError) {
            serverError = <label className='control-label'>{this.state.serverError}</label>;
            errorClass = ' has-error';
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div className='signup__email-container'>
                    <p>
                        <FormattedMessage
                            id='login_mfa.enterToken'
                            defaultMessage="To complete the sign in process, please enter a token from your smartphone's authenticator"
                        />
                    </p>
                    <div className={'form-group' + errorClass}>
                        {serverError}
                    </div>
                    <div className={'form-group' + errorClass}>
                        <LocalizedInput
                            type='text'
                            className='form-control'
                            name='token'
                            placeholder={{id: t('login_mfa.token'), defaultMessage: 'MFA Token'}}
                            spellCheck='false'
                            autoComplete='off'
                            autoFocus={true}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <SaveButton
                            saving={this.state.saving}
                            disabled={this.state.saving}
                            onClick={this.handleSubmit}
                            defaultMessage={localizeMessage('login_mfa.submit', 'Submit')}
                            savingMessage={localizeMessage('login_mfa.submitting', 'Submitting...')}
                        />
                    </div>
                </div>
            </form>
        );
    }
}
