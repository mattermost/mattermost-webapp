// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';

import './generic_modal.scss';

type Props = {
    className?: string;
    onExited: () => void;
    modalHeaderText?: React.ReactNode;
    show?: boolean;
    handleCancel?: () => void;
    handleConfirm?: () => void;
    handleEnterKeyPress?: () => void;
    confirmButtonText?: React.ReactNode;
    confirmButtonClassName?: string;
    cancelButtonText?: React.ReactNode;
    isConfirmDisabled?: boolean;
    id: string;
    autoCloseOnCancelButton?: boolean;
    autoCloseOnConfirmButton?: boolean;
    enforceFocus?: boolean;
    container?: React.ReactNode | React.ReactNodeArray;
    ariaLabel?: string;
};

type State = {
    show: boolean;
}

export default class GenericModal extends React.PureComponent<Props, State> {
    static defaultProps: Partial<Props> = {
        show: true,
        id: 'genericModal',
        autoCloseOnCancelButton: true,
        autoCloseOnConfirmButton: true,
        enforceFocus: true,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            show: props.show!,
        };
    }

    onHide = () => {
        this.setState({show: false});
    }

    handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (this.props.autoCloseOnCancelButton) {
            this.onHide();
        }
        if (this.props.handleCancel) {
            this.props.handleCancel();
        }
    }

    handleConfirm = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (this.props.autoCloseOnConfirmButton) {
            this.onHide();
        }
        if (this.props.handleConfirm) {
            this.props.handleConfirm();
        }
    }

    private onEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === Constants.KeyCodes.ENTER[0]) {
            if (this.props.autoCloseOnConfirmButton) {
                this.onHide();
            }
            if (this.props.handleEnterKeyPress) {
                this.props.handleEnterKeyPress();
            }
        }
    }

    render() {
        let confirmButton;
        if (this.props.handleConfirm) {
            let confirmButtonText: React.ReactNode = (
                <FormattedMessage
                    id='generic_modal.confirm'
                    defaultMessage='Confirm'
                />
            );
            if (this.props.confirmButtonText) {
                confirmButtonText = this.props.confirmButtonText;
            }

            confirmButton = (
                <button
                    type='submit'
                    className={classNames(`GenericModal__button confirm ${this.props.confirmButtonClassName}`, {
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
            let cancelButtonText: React.ReactNode = (
                <FormattedMessage
                    id='generic_modal.cancel'
                    defaultMessage='Cancel'
                />
            );
            if (this.props.cancelButtonText) {
                cancelButtonText = this.props.cancelButtonText;
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
                dialogClassName={classNames('a11y__modal GenericModal', this.props.className)}
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onExited}
                enforceFocus={this.props.enforceFocus}
                restoreFocus={true}
                role='dialog'
                aria-label={this.props.ariaLabel}
                aria-labelledby={this.props.ariaLabel ? undefined : 'genericModalLabel'}
                id={this.props.id}
                container={this.props.container}
            >
                <div
                    onKeyDown={this.onEnterKeyDown}
                    tabIndex={0}
                    className='GenericModal__wrapper-enter-key-press-catcher'
                >
                    <Modal.Header
                        closeButton={true}
                    />
                    <Modal.Body>
                        {this.props.modalHeaderText && <div className='GenericModal__header'>
                            <h1 id='genericModalLabel'>
                                {this.props.modalHeaderText}
                            </h1>
                        </div>}
                        <div className='GenericModal__body'>
                            {this.props.children}
                        </div>
                    </Modal.Body>
                    {(cancelButton || confirmButton) && <Modal.Footer>
                        {cancelButton}
                        {confirmButton}
                    </Modal.Footer>}
                </div>

            </Modal>
        );
    }
}
