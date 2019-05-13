// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {isEmail} from 'mattermost-redux/utils/helpers';

import {sendPasswordResetEmail} from 'actions/user_actions.jsx';
import BackButton from 'components/common/back_button.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n.jsx';

class PasswordResetSendLink extends React.Component {
    constructor(props) {
        super(props);

        this.handleSendLink = this.handleSendLink.bind(this);

        this.state = {
            error: '',
            updateText: '',
        };
    }
    handleSendLink(e) {
        e.preventDefault();

        var email = ReactDOM.findDOMNode(this.refs.email).value.trim().toLowerCase();
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
        this.setState({
            error: '',
        });

        sendPasswordResetEmail(
            email,
            () => {
                this.setState({
                    error: null,
                    updateText: (
                        <div className='reset-form alert alert-success'>
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
                $(ReactDOM.findDOMNode(this.refs.reset_form)).hide();
            },
            (err) => {
                this.setState({
                    error: err.message,
                    update_text: null,
                });
            }
        );
    }
    render() {
        var error = null;
        if (this.state.error) {
            error = <div className='form-group has-error'><label className='control-label'>{this.state.error}</label></div>;
        }

        var formClass = 'form-group';
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
                            ref='reset_form'
                        >
                            <p>
                                <FormattedMessage
                                    id='password_send.description'
                                    defaultMessage='To reset your password, enter the email address you used to sign up'
                                />
                            </p>
                            <div className={formClass}>
                                <LocalizedInput
                                    type='email'
                                    className='form-control'
                                    name='email'
                                    ref='email'
                                    placeholder={{id: t('password_send.email'), defaultMessage: 'Email'}}
                                    spellCheck='false'
                                />
                            </div>
                            {error}
                            <button
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

PasswordResetSendLink.defaultProps = {
};
PasswordResetSendLink.propTypes = {
    params: PropTypes.object.isRequired,
};

export default PasswordResetSendLink;
