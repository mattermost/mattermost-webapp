// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import './generic_modal.scss';

type Props = {
    onHide: () => void;
    modalHeaderText: string | JSX.Element;
    handleCancel?: () => void;
    handleConfirm?: () => void;
    confirmButtonText?: string | JSX.Element;
    confirmButtonClassName?: string;
    cancelButtonText?: string | JSX.Element;
    isConfirmDisabled?: boolean;
};

type State = {
    show: boolean;
}

export default class GenericModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    onHide = () => {
        this.setState({show: false}, this.props.onHide);
    }

    handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        this.onHide();
        if (this.props.handleCancel) {
            this.props.handleCancel();
        }
    }

    handleConfirm = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        this.onHide();
        if (this.props.handleConfirm) {
            this.props.handleConfirm();
        }
    }

    render() {
        let confirmButton;
        if (this.props.handleConfirm) {
            let confirmButtonText = (
                <FormattedMessage 
                    id='generic_modal.confirm' 
                    defaultMessage='Confirm'
                />
            );
            if (this.props.confirmButtonText) {
                confirmButtonText = (
                    <React.Fragment>
                        {this.props.confirmButtonText}
                    </React.Fragment>
                );
            }

            confirmButton = (
                <button
                    type='submit'
                    className={classNames(`GenericModal__button create ${this.props.confirmButtonClassName}`, {
                        disabled: this.props.isConfirmDisabled,
                    })}
                    onClick={this.handleConfirm}
                    disabled={this.props.isConfirmDisabled}
                >
                    {confirmButtonText}
                </button>
            );
        }

        let cancelButton;
        if (this.props.handleCancel) {
            let cancelButtonText = (
                <FormattedMessage 
                    id='generic_modal.cancel' 
                    defaultMessage='Cancel'
                />
            );
            if (this.props.cancelButtonText) {
                cancelButtonText = (
                    <React.Fragment>
                        {this.props.cancelButtonText}
                    </React.Fragment>
                );
            }

            cancelButton = (
                <button
                    type='button'
                    className='GenericModal__button cancel'
                    onClick={this.handleCancel}
                >
                    {cancelButtonText}
                </button>
            );
        }

        return (
            <Modal
                dialogClassName='a11y__modal GenericModal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.onHide}
                enforceFocus={true}
                restoreFocus={true}
                role='dialog'
                aria-labelledby='genericModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                />
                <form>
                    <Modal.Body>
                        <div className='GenericModal__header'>
                            <h1 id='genericModalLabel'>
                                {this.props.modalHeaderText}
                            </h1>
                        </div>
                        <div className='GenericModal__body'>
                            {this.props.children}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {cancelButton}
                        {confirmButton}
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
