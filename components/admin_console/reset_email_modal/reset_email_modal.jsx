// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {isEmail} from 'mattermost-redux/utils/helpers';

import {adminResetEmail} from 'actions/admin_actions.jsx';

export default class ResetEmailModal extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object,
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
            error: null,
        };

        this.emailRef = React.createRef();
    }

    doSubmit = (e) => {
        e.preventDefault();

        if (this.emailRef.current) {
            const email = this.emailRef.current.value;
            if (!isEmail(email)) {
                const errMsg = (
                    <FormattedMessage
                        id='user.settings.general.validEmail'
                        defaultMessage='Please enter a valid email address.'
                    />
                );
                this.setState({error: errMsg});
                return;
            }
        }

        const user = Object.assign({}, this.props.user);
        const email = this.emailRef.current.value.trim().toLowerCase();
        user.email = email;

        this.setState({error: null});

        adminResetEmail(
            user,
            () => {
                this.props.onModalSubmit(this.props.user);
            },
            (err) => {
                const serverError = err.message ? err.message : err;
                this.setState({error: serverError});
            },
        );
    }

    doCancel = () => {
        this.setState({error: null});
        this.props.onModalDismissed();
    }

    render() {
        if (!this.props.user) {
            return <div/>;
        }

        let urlClass = 'input-group input-group--limit';
        let errorMsg = null;
        if (this.state.error) {
            urlClass += ' has-error';
            errorMsg = <div className='has-error'><p className='input__help error'>{this.state.error}</p></div>;
        }

        const title = (
            <FormattedMessage
                id='admin.reset_email.titleReset'
                defaultMessage='Update Email'
            />
        );

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.doCancel}
                role='dialog'
                aria-labelledby='resetEmailModalLabel'
                data-testid='resetEmailModal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='resetEmailModalLabel'
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
                            <div className='col-sm-10'>
                                <div
                                    className={urlClass}
                                    data-testid='resetEmailForm'
                                >
                                    <span
                                        data-toggle='tooltip'
                                        title='New Email'
                                        className='input-group-addon email__group-addon'
                                    >
                                        <FormattedMessage
                                            id='admin.reset_email.newEmail'
                                            defaultMessage='New Email'
                                        />
                                    </span>
                                    <input
                                        type='email'
                                        ref={this.emailRef}
                                        className='form-control'
                                        maxLength='128'
                                        autoFocus={true}
                                    />
                                </div>
                                {errorMsg}
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
                                id='admin.reset_email.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            onClick={this.doSubmit}
                            type='submit'
                            className='btn btn-primary'
                            data-testid='resetEmailButton'
                        >
                            <FormattedMessage
                                id='admin.reset_email.reset'
                                defaultMessage='Reset'
                            />
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
