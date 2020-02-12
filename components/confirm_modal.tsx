// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

type Props = {

    /*
     * Set to show modal
     */
    show: boolean;

    /*
     * Title to use for the modal
     */
    title?: React.ReactNode;

    /*
     * Message to display in the body of the modal
     */
    message?: React.ReactNode;

    /*
     * The CSS class to apply to the confirm button
     */
    confirmButtonClass?: string;

    /*
     * The CSS class to apply to the modal
     */
    modalClass?: string;

    /*
     * Text/jsx element on the confirm button
     */
    confirmButtonText?: React.ReactNode;

    /*
     * Text/jsx element on the cancel button
     */
    cancelButtonText?: React.ReactNode;

    /*
     * Set to show checkbox
     */
    showCheckbox?: boolean;

    /*
     * Text/jsx element to display with the checkbox
     */
    checkboxText?: React.ReactNode;

    /*
     * Function called when the confirm button or ENTER is pressed. Passes `true` if the checkbox is checked
     */
    onConfirm: (checked: boolean) => void;

    /*
     * Function called when the cancel button is pressed or the modal is hidden. Passes `true` if the checkbox is checked
     */
    onCancel: (checked: boolean) => void;

    /**
     * Function called when modal is dismissed
     */
    onExited?: () => void;

    /*
     * Set to hide the cancel button
     */
    hideCancel?: boolean;
};

type State = {
    checked: boolean;
}

export default class ConfirmModal extends React.Component<Props, State> {
    static defaultProps = {
        title: '',
        message: '',
        confirmButtonClass: 'btn btn-primary',
        confirmButtonText: '',
        modalClass: '',
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            checked: false,
        };
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

    componentDidUpdate(prevProps: Props) {
        if (prevProps.show && !this.props.show) {
            document.removeEventListener('keydown', this.handleKeypress);
        } else if (!prevProps.show && this.props.show) {
            document.addEventListener('keydown', this.handleKeypress);
        }
    }

    handleKeypress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && this.props.show) {
            const cancelButton = document.getElementById('cancelModalButton');
            if (cancelButton && cancelButton === document.activeElement) {
                this.handleCancel();
            } else {
                this.handleConfirm();
            }
        }
    }

    handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({checked: e.target.checked});
    }

    handleConfirm = () => {
        this.props.onConfirm(this.state.checked);
    }

    handleCancel = () => {
        this.props.onCancel(this.state.checked);
    }

    render() {
        let checkbox;
        if (this.props.showCheckbox) {
            checkbox = (
                <div className='checkbox text-right mb-0'>
                    <label>
                        <input
                            type='checkbox'
                            onChange={this.handleCheckboxChange}
                            checked={this.state.checked}
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
