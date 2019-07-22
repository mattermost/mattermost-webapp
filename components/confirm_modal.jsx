// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

export default class ConfirmModal extends React.Component {
    static propTypes = {

        /*
         * Set to show modal
         */
        show: PropTypes.bool.isRequired,

        /*
         * Title to use for the modal
         */
        title: PropTypes.node,

        /*
         * Message to display in the body of the modal
         */
        message: PropTypes.node,

        /*
         * The CSS class to apply to the confirm button
         */
        confirmButtonClass: PropTypes.string,

        /*
         * The CSS class to apply to the modal
         */
        modalClass: PropTypes.string,

        /*
         * Text/jsx element on the confirm button
         */
        confirmButtonText: PropTypes.node,

        /*
         * Text/jsx element on the cancel button
         */
        cancelButtonText: PropTypes.node,

        /*
         * Set to show checkbox
         */
        showCheckbox: PropTypes.bool,

        /*
         * Text/jsx element to display with the checkbox
         */
        checkboxText: PropTypes.node,

        /*
         * Function called when the confirm button or ENTER is pressed. Passes `true` if the checkbox is checked
         */
        onConfirm: PropTypes.func.isRequired,

        /*
         * Function called when the cancel button is pressed or the modal is hidden. Passes `true` if the checkbox is checked
         */
        onCancel: PropTypes.func.isRequired,

        /**
         * Function called when modal is dismissed
         */
        onExited: PropTypes.func,

        /*
         * Set to hide the cancel button
         */
        hideCancel: PropTypes.bool,
    }

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

    shouldComponentUpdate(nextProps) {
        return nextProps.show !== this.props.show;
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.show && !nextProps.show) {
            document.removeEventListener('keydown', this.handleKeypress);
        } else if (!this.props.show && nextProps.show) {
            document.addEventListener('keydown', this.handleKeypress);
        }
    }

    handleKeypress = (e) => {
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
                    className='btn btn-link btn-cancel'
                    onClick={this.handleCancel}
                    id='cancelModalButton'
                >
                    {cancelText}
                </button>
            );
        }

        return (
            <Modal
                className={'modal-confirm ' + this.props.modalClass}
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.props.onCancel}
                onExited={this.props.onExited}
                id='confirmModal'
                role='dialog'
                aria-labelledby='confirmModalLabel'
            >
                <Modal.Header closeButton={false}>
                    <Modal.Title
                        componentClass='h1'
                        id='confirmModalLabel'
                    >
                        {this.props.title}
                    </Modal.Title>
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
                        id='confirmModalButton'
                    >
                        {this.props.confirmButtonText}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
