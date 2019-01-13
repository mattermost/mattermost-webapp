// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import * as React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

type Props = {|
    show: boolean,
    title: React.Node,
    message: React.Node,
    confirmButtonClass: string,
    modalClass: string,
    confirmButtonText: React.Node,
    cancelButtonText?: React.Node,
    showCheckbox?: boolean,
    checkboxText: React.Node,
    onConfirm: (boolean) => null,
    onCancel: (boolean) => null,
    onExited: () => null,
    hideCancel?: boolean,
|}

export default class ConfirmModal extends React.Component<Props> {
    static defaultProps = {
        title: '',
        message: '',
        confirmButtonClass: 'btn btn-primary',
        confirmButtonText: '',
        modalClass: '',
    }

    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('keydown', this.handleKeypress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeypress);
    }

    shouldComponentUpdate(nextProps: Props) {
        return nextProps.show !== this.props.show;
    }

    UNSAFE_componentWillReceiveProps(nextProps: Props) { // eslint-disable-line camelcase
        if (this.props.show && !nextProps.show) {
            document.removeEventListener('keydown', this.handleKeypress);
        } else if (!this.props.show && nextProps.show) {
            document.addEventListener('keydown', this.handleKeypress);
        }
    }

    handleKeypress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && this.props.show) {
            this.handleConfirm();
        }
    }

    handleConfirm = () => {
        const checked = this.refs.checkbox ? this.refs.checkbox.checked : false;
        this.props.onConfirm(checked);
    }

    handleCancel = () => {
        const checked = this.refs.checkbox ? this.refs.checkbox.checked : false;
        this.props.onCancel(checked);
    }

    render() {
        let checkbox;
        if (this.props.showCheckbox) {
            checkbox = (
                <div className='checkbox text-right margin-bottom--none'>
                    <label>
                        <input
                            ref='checkbox'
                            type='checkbox'
                        />
                        {this.props.checkboxText}
                    </label>
                </div>
            );
        }

        let cancelText;
        if (this.props.cancelButtonText) {
            cancelText = this.props.cancelButtonText;
        } else {
            cancelText = (
                <FormattedMessage
                    id='confirm_modal.cancel'
                    defaultMessage='Cancel'
                />
            );
        }

        let cancelButton;
        if (!this.props.hideCancel) {
            cancelButton = (
                <button
                    type='button'
                    className='btn btn-link'
                    onClick={this.handleCancel}
                >
                    {cancelText}
                </button>
            );
        }

        return (
            <Modal
                className={'modal-confirm ' + this.props.modalClass}
                show={this.props.show}
                onHide={this.props.onCancel}
                onExited={this.props.onExited}
            >
                <Modal.Header closeButton={false}>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.message}
                    {checkbox}
                </Modal.Body>
                <Modal.Footer>
                    {cancelButton}
                    <button
                        autoFocus={true}
                        type='button'
                        className={this.props.confirmButtonClass}
                        onClick={this.handleConfirm}
                    >
                        {this.props.confirmButtonText}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
