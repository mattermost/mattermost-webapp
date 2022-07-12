// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

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
    cancelButtonClassName?: string;
    isConfirmDisabled?: boolean;
    id: string;
    autoCloseOnCancelButton?: boolean;
    autoCloseOnConfirmButton?: boolean;
    enforceFocus?: boolean;
    container?: React.ReactNode | React.ReactNodeArray;
    ariaLabel?: string;
    errorText?: string;
    compassDesign?: boolean;
    backdrop?: boolean;
    backdropClassName?: string;
};

type State = {
    show: boolean;
}

export class GenericModal extends React.PureComponent<Props, State> {
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
        if (event.key === 'Enter') {
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
                    className={classNames('GenericModal__button cancel', this.props.cancelButtonClassName)}
                    onClick={this.handleCancel}
                >
                    {cancelButtonText}
                </button>
            );
        }

        const headerText = this.props.modalHeaderText && (
            <div className='GenericModal__header'>
                <h1 id='genericModalLabel'>
                    {this.props.modalHeaderText}
                </h1>
            </div>
        );

        return (
            <StyledModal
                dialogClassName={classNames('a11y__modal GenericModal', {GenericModal__compassDesign: this.props.compassDesign}, this.props.className)}
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
                backdrop={this.props.backdrop}
                backdropClassName={this.props.backdropClassName}
            >
                <div
                    onKeyDown={this.onEnterKeyDown}
                    tabIndex={0}
                    className='GenericModal__wrapper-enter-key-press-catcher'
                >
                    <Modal.Header closeButton={true}>
                        {this.props.compassDesign && headerText}
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.compassDesign ? (
                            this.props.errorText && (
                                <div className='genericModalError'>
                                    <i className='icon icon-alert-outline'/>
                                    <span>{this.props.errorText}</span>
                                </div>
                            )
                        ) : (
                            headerText
                        )}
                        <div className='GenericModal__body'>
                            {this.props.children}
                        </div>
                    </Modal.Body>
                    {(cancelButton || confirmButton) && <Modal.Footer>
                        {cancelButton}
                        {confirmButton}
                    </Modal.Footer>}
                </div>
            </StyledModal>
        );
    }
}

const StyledModal = styled(Modal)`
&&& {
    .modal-dialog {
        margin-top: calc(50vh - 240px);
    }

    .modal-overflow {
        .modal-body {
            overflow: visible;
        }
    }

    .modal-body {
        max-height: 100%;
        padding: 0;

        .form-control {
            height: 40px;
            box-sizing: border-box;
            border: 2px solid var(--button-bg);
            border-radius: 4px;

            &.has-error {
                border-color: var(--error-text);
            }
        }

        .MaxLengthInput {
            &.form-control.has-error {
                padding-right: 66px;
            }

            &__validation {
                position: absolute;
                top: 12px;
                right: 56px;
                color: var(--error-text);
                font-size: 14px;
                font-style: normal;
                font-weight: normal;
                line-height: 16px;
            }
        }

        .input-clear {
            top: 12px;
            right: 36px;
            width: 16px;
            height: 16px;
            color: var(--center-channel-color);
            font-size: 18px;
            font-style: normal;
            font-weight: normal;
            line-height: 16px;
            opacity: 0.48;
        }
    }

    .modal-content {
        padding: 16px 15px;
        border-radius: 8px;
    }

    .modal-header {
        min-height: 0;
        padding: 0;
        border: none;
        background: transparent;

        .close {
            top: 6px;
            right: 6px;
            display: flex;
            width: 4rem;
            height: 4rem;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            color: rgba(var(--center-channel-color-rgb), 0.56);
            font-size: 32px;
            font-weight: 400;

            &:hover {
                background-color: rgba(var(--center-channel-color-rgb), 0.08);
                color: rgba(var(--center-channel-color-rgb), 0.72);
            }

            &:active {
                background-color: rgba(var(--button-bg-rgb), 0.08);
                color: v(button-bg);
            }
        }
    }

    .modal-footer {
        padding: 12px 24px 24px 24px;
        border: none;
        border-radius: 4px;
    }

    &.GenericModal__compassDesign {
        .modal-content {
            padding: 0;
            border-radius: 12px;

            .modal-header {
                padding: 26px 32px 15px;

                .close {
                    top: 20px;
                    right: 18px;
                    width: 40px;
                    height: 40px;
                    box-shadow: none;

                    &:active {
                        background: rgba(var(--button-bg-rgb), 0.08);
                        color: var(--button-bg);
                    }

                    &:focus {
                        box-sizing: border-box;
                        border: 2px solid var(--sidebar-text-active-border);
                    }
                }

                .GenericModal__header {
                    padding: 0;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;

                    h1 {
                        color: var(--center-channel-color);
                        font-size: 22px;
                    }
                }
            }

            .modal-body {
                padding: 15px 32px 0;

                .GenericModal__body {
                    padding: 0;
                }
            }

            .modal-footer {
                padding: 24px 32px;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
            }

            .genericModalError {
                display: flex;
                box-sizing: border-box;
                flex: 1;
                padding: 14px;
                border: 1px solid rgba(var(--dnd-indicator-rgb), 0.16);
                margin-bottom: 24px;
                background: rgba(var(--dnd-indicator-rgb), 0.08);
                border-radius: 4px;

                span {
                    color: var(--center-channel-color);
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 24px;
                }

                i {
                    margin-right: 8px;
                    color: var(--error-text);
                    font-size: 24px;
                    line-height: 24px;

                    &::before {
                        margin: 0;
                    }
                }
            }

            .GenericModal__button {
                padding: 13px 20px;
                border: none;
                border-radius: 4px;
                box-shadow: none;

                height: 40px;
                padding: 0 20px;
                font-size: 14px;
                line-height: 14px;

                &.cancel {
                    margin-right: 8px;
                    background: var(--center-channel-bg);
                    background: rgba(var(--button-bg-rgb), 0.08);
                    color: var(--button-bg);

                    &:hover {
                        background: rgba(var(--button-bg-rgb), 0.12);
                    }

                    &:active {
                        background: rgba(var(--button-bg-rgb), 0.16);
                    }

                    &:focus {
                        box-sizing: border-box;
                        padding: 11px 18px;
                        border: 2px solid var(--sidebar-text-active-border);
                    }
                }

                &.confirm {
                    height: 40px;
                    padding: 0 20px;
                    font-size: 14px;
                    line-height: 14px;

                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 0;
                    background: var(--button-bg);
                    border-radius: 4px;
                    color: var(--button-color);
                    font-weight: 600;
                    transition: all 0.15s ease-out;

                    &:hover {
                        background: linear-gradient(0deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), var(--button-bg);
                    }

                    &:active {
                        background: linear-gradient(0deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.16)), var(--button-bg);
                    }

                    &:focus {
                        box-sizing: border-box;
                        border: 2px solid var(--sidebar-text-active-border);
                        outline: none;
                    }

                    &:disabled {
                        background: rgba(var(--center-channel-color-rgb), 0.08);
                        color: rgba(var(--center-channel-color-rgb), 0.32);
                        cursor: not-allowed;
                    }

                    i {
                        display: flex;
                        font-size: 18px;
                    }

                    &:focus {
                        padding: 11px 18px;
                    }
                }
            }
        }

        @media screen and (max-width: 640px) {
            margin: 0;

            .modal-header {
                box-shadow: var(--elevation-2);
            }
        }
    }

    &__wrapper-enter-key-press-catcher {
        width: 100%;
        height: 100%;
    }
}

.GenericModal__header {
    padding: 28px 24px 16px 24px;

    h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        line-height: 28px;
    }
}

.GenericModal__body {
    position: relative;
    width: 100%;
    padding: 0 24px;
    color: rgba(var(--center-channel-color-rgb), 0.72);
    font-family: Open Sans;
    font-size: 14px;
    font-style: normal;
    font-weight: normal;
    line-height: 20px;
}

.GenericModal__button {
    padding: 12px 16px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    line-height: 12px;

    &.cancel {
        background: var(--center-channel-bg);
        color: var(--button-bg);
    }

    &.confirm {
        background: var(--button-bg);
        border-radius: 4px;
        color: var(--button-color);

        &.disabled {
            background: rgba(var(--center-channel-color-rgb), 0.08);
            color: rgba(var(--center-channel-color-rgb), 0.32);
        }
    }
}
`;
