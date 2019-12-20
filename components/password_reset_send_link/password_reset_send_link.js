// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isEmail} from 'mattermost-redux/utils/helpers';

import BackButton from 'components/common/back_button';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n.jsx';

export default class PasswordResetSendLink extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            sendPasswordResetEmail: PropTypes.func.isRequired,
        }).isRequired,
    };

    state = {
        error: null,
        updateText: null,
    };
    resetForm = React.createRef();
    emailInput = React.createRef();

    handleSendLink = async (e) => {
        e.preventDefault();

        const email = this.emailInput.current.value.trim().toLowerCase();
        if (!email || !isEmail(email)) {
            this.setState({
                error: (
                    <FormattedMessage
                        id={'password_send.error'}
                        defaultMessage={'Please enter a valid email address.'}
                    />
                ),
            });
            return;
        }

        // End of error checking clear error
        this.setState({error: null});

        const {data, error} = await this.props.actions.sendPasswordResetEmail(email);
        if (data) {
            this.setState({
                error: null,
                updateText: (
                    <div
                        id='passwordResetEmailSent'
                        className='reset-form alert alert-success'
                    >
                        <FormattedMessage
                            id='password_send.link'
                            defaultMessage='If the account exists, a password reset email will be sent to:'
                        />
                        <div>
                            <b>{email}</b>
                        </div>
                        <br/>
                        <FormattedMessage
                            id='password_send.checkInbox'
                            defaultMessage='Please check your inbox.'
                        />
                    </div>
                ),
            });
            if (this.resetForm.current) {
                this.resetForm.current.hidden = true;
            }
        } else if (error) {
            this.setState({
                error: error.message,
                update_text: null,
            });
        }
    }

    render() {
        let error = null;
        if (this.state.error) {
            error = (
                <div className='form-group has-error'>
                    <label className='control-label'>{this.state.error}</label>
                </div>
            );
        }

        let formClass = 'form-group';
        if (error) {
            formClass += ' has-error';
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <h3>
                            <FormattedMessage
                                id='password_send.title'
                                defaultMessage='Password Reset'
                            />
                        </h3>
                        {this.state.updateText}
                        <form
                            onSubmit={this.handleSendLink}
                            ref={this.resetForm}
                        >
                            <p>
                                <FormattedMessage
                                    id='password_send.description'
                                    defaultMessage='To reset your password, enter the email address you used to sign up'
                                />
                            </p>
                            <div className={formClass}>
                                <LocalizedInput
                                    id='passwordResetEmailInput'
                                    type='email'
                                    className='form-control'
                                    name='email'
                                    placeholder={{id: t('password_send.email'), defaultMessage: 'Email'}}
                                    ref={this.emailInput}
                                    spellCheck='false'
                                    autoFocus={true}
                                />
                            </div>
                            {error}
                            <button
                                id='passwordResetButton'
                                type='submit'
                                className='btn btn-primary'
                            >
                                <FormattedMessage
                                    id='password_send.reset'
                                    defaultMessage='Reset my password'
                                />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
