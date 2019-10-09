// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Props = {

    /*
     * Set to show modal
     */
    show: boolean;

    /*
 * Title to use for the modal
 */

    title: string;

    /*
   * Message to display in the body of the modal
   */
    message: string;

    /*
      * The CSS class to apply to the confirm button
      */
    confirmButtonClass: any;


    /*
     * The CSS class to apply to the modal
     */
    modalClass: string;
    /*
   * Text/jsx element on the confirm button
   */
    confirmButtonText: any;

    /*
     * Text/jsx element on the cancel button
     */
    cancelButtonText: any;

    /*
     * Set to show checkbox
     */
    showCheckbox: boolean;

    /*
     * Text/jsx element to display with the checkbox
     */
    checkboxText: any;

    /*
     * Function called when the confirm button or ENTER is pressed. Passes `true` if the checkbox is checked
     */
    onConfirm: Function;

    /*
     * Function called when the cancel button is pressed or the modal is hidden. Passes `true` if the checkbox is checked
     */
    onCancel: Function;

    /**
     * Function called when modal is dismissed
     */
    onExited: Function;

    /*
     * Set to hide the cancel button
     */
    hideCancel: boolean;
};

export default class ConfirmModal extends React.PureComponent<Props> {

    public constructor(props: Props) {
        super(props);
    }

    static defaultProps = {
        title: '',
        message: '',
        confirmButtonClass: 'btn btn-primary',
        confirmButtonText: '',
        modalClass: '',
    };

    componentDidMount(): void {
        if (this.props.show) {
            document.addEventListener('keydown', this.handleKeypress);
        }
    }

    componentWillUnmount(): void {
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

    private readonly handleKeypress = (e: KeyboardEvent) : void => {
        if (e.key === 'Enter' && this.props.show) {
            this.handleConfirm();
        }
    }

    private readonly handleConfirm = (): void => {
        const checked = this.refs.checkbox ? this.refs.checkbox.checked : false;
        this.props.onConfirm(checked);
    }

    private readonly handleCancel = (): void => {
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
