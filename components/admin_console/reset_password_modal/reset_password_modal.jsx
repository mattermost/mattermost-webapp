// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {adminResetPassword} from 'actions/admin_actions.jsx';
import * as Utils from 'utils/utils.jsx';

export default class ResetPasswordModal extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        currentUserId: PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
        onModalSubmit: PropTypes.func,
        onModalDismissed: PropTypes.func,
        passwordConfig: PropTypes.object,
    };

    static defaultProps = {
        show: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            serverErrorNewPass: null,
            serverErrorCurrentPass: null,
        };
    }

    componentWillUnmount() {
        this.setState({
            serverErrorNewPass: null,
            serverErrorCurrentPass: null,
        });
    }

    doSubmit = (e) => {
        e.preventDefault();
        let currentPassword = '';
        if (this.refs.currentPassword) {
            currentPassword = this.refs.currentPassword.value;
            if (currentPassword === '') {
                let errorMsg = '';
                errorMsg = (
                    <FormattedMessage
                        id='admin.reset_password.missing_current'
                        defaultMessage='Please enter your current password.'
                    />
                );
                this.setState({serverErrorCurrentPass: errorMsg});
                return;
            }
        }

        const password = this.refs.password.value;

        const {valid, error} = Utils.isValidPassword(password, this.props.passwordConfig);
        if (!valid && error) {
            this.setState({serverErrorNewPass: error});
            return;
        }

        this.setState({serverErrorNewPass: null});

        adminResetPassword(
            this.props.user.id,
            currentPassword,
            password,
            () => {
                this.props.onModalSubmit(this.props.user);
            },
            (err) => {
                this.setState({serverErrorCurrentPass: err.message});
            }
        );
    }

    doCancel = () => {
        this.setState({
            serverErrorNewPass: null,
            serverErrorCurrentPass: null,
        });
        this.props.onModalDismissed();
    }

    render() {
        const user = this.props.user;
        if (user == null) {
            return <div/>;
        }

        let urlClass = 'input-group input-group--limit';
        let serverErrorNewPass = null;

        if (this.state.serverErrorNewPass) {
            urlClass += ' has-error';
            serverErrorNewPass = <div className='has-error'><p className='input__help error'>{this.state.serverErrorNewPass}</p></div>;
        }

        let title;
        if (user.auth_service) {
            title = (
                <FormattedMessage
                    id='admin.reset_password.titleSwitch'
                    defaultMessage='Switch Account to Email/Password'
                />
            );
        } else {
            title = (
                <FormattedMessage
                    id='admin.reset_password.titleReset'
                    defaultMessage='Reset Password'
                />
            );
        }

        let currentPassword = null;
        let serverErrorCurrentPass = null;
        let newPasswordFocus = true;
        if (this.props.currentUserId === user.id) {
            newPasswordFocus = false;
            let urlClassCurrentPass = 'input-group input-group--limit';
            if (this.state.serverErrorCurrentPass) {
                urlClassCurrentPass += ' has-error';
                serverErrorCurrentPass = <div className='has-error'><p className='input__help error'>{this.state.serverErrorCurrentPass}</p></div>;
            }
            currentPassword = (
                <div className='col-sm-10 password__group-addon-space'>
                    <div className={urlClassCurrentPass}>
                        <span
                            data-toggle='tooltip'
                            title='Current Password'
                            className='input-group-addon password__group-addon'
                        >
                            <FormattedMessage
                                id='admin.reset_password.curentPassword'
                                defaultMessage='Current Password'
                            />
                        </span>
                        <input
                            type='password'
                            ref='currentPassword'
                            className='form-control'
                            autoFocus={true}
                        />
                    </div>
                </div>
            );
        }

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.doCancel}
                role='dialog'
                aria-labelledby='resetPasswordModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='resetPasswordModalLabel'
                    >
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <form
                    role='form'
                    className='form-horizontal'
                >
                    <Modal.Body>
                        <div className='form-group'>
                            {currentPassword}
                            <div className='col-sm-10'>
                                <div className={urlClass}>
                                    <span
                                        data-toggle='tooltip'
                                        title='New Password'
                                        className='input-group-addon password__group-addon'
                                    >
                                        <FormattedMessage
                                            id='admin.reset_password.newPassword'
                                            defaultMessage='New Password'
                                        />
                                    </span>
                                    <input
                                        type='password'
                                        ref='password'
                                        className='form-control'
                                        autoFocus={newPasswordFocus}
                                    />
                                </div>
                                {serverErrorNewPass}
                                {serverErrorCurrentPass}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-link'
                            onClick={this.doCancel}
                        >
                            <FormattedMessage
                                id='admin.reset_password.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            onClick={this.doSubmit}
                            type='submit'
                            className='btn btn-primary'
                        >
                            <FormattedMessage
                                id='admin.reset_password.reset'
                                defaultMessage='Reset'
                            />
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
