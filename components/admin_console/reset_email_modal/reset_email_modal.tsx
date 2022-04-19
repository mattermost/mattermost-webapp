// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';
import {ActionResult} from 'mattermost-redux/types/actions';

import {isEmail} from 'mattermost-redux/utils/helpers';

type State = {
    error: JSX.Element|string|null;
}

type Props = {
    user?: UserProfile;
    show: boolean;
    onModalSubmit: (user?: UserProfile) => void;
    onModalDismissed: () => void;
    actions: {
        patchUser: (user: UserProfile) => ActionResult;
    };
}

export default class ResetEmailModal extends React.PureComponent<Props, State> {
    private emailRef: React.RefObject<HTMLInputElement>;
    public static defaultProps: Partial<Props> = {
        show: false,
    };

    public constructor(props: Props) {
        super(props);

        this.state = {
            error: null,
        };

        this.emailRef = React.createRef();
    }

    private doSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (!this.props.user) {
            return;
        }

        let email = '';
        if (this.emailRef.current) {
            email = this.emailRef.current.value;

            // function isEmail aready handle empty / null value
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
            email = email.trim().toLowerCase();
        }

        const user = {
            ...this.props.user,
            email,
        };

        const result = await this.props.actions.patchUser(user);
        if ('error' in result) {
            this.setState({error: result.error.message});
            return;
        }
        this.props.onModalSubmit(this.props.user);
    }

    private doCancel = (): void => {
        this.setState({
            error: null,
        });
        this.props.onModalDismissed();
    }

    public render(): JSX.Element {
        const user = this.props.user;
        if (!user) {
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
                                        maxLength={128}
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
