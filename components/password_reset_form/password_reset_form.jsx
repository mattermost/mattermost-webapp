// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {resetPassword} from 'actions/user_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

class PasswordResetForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    handlePasswordReset = (e) => {
        e.preventDefault();

        const password = ReactDOM.findDOMNode(this.refs.password).value;
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

        this.setState({
            error: null,
        });

        resetPassword(
            (new URLSearchParams(this.props.location.search)).get('token'),
            password,
            () => {
                this.setState({error: null});
            },
            (err) => {
                this.setState({error: err.message});
            }
        );
    }

    render() {
        var error = null;
        if (this.state.error) {
            error = (
                <div className='form-group has-error'>
                    <label className='control-label'>
                        {this.state.error}
                    </label>
                </div>
            );
        }

        var formClass = 'form-group';
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
                            <input
                                type='password'
                                className='form-control'
                                name='password'
                                ref='password'
                                placeholder={Utils.localizeMessage(
                                    'password_form.pwd',
                                    'Password'
                                )}
                                spellCheck='false'
                            />
                        </div>
                        {error}
                        <button
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

PasswordResetForm.propTypes = {
    location: PropTypes.object.isRequired,
    siteName: PropTypes.string,
};

export default PasswordResetForm;
