// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import ConfirmModal from './confirm_modal';

export default class DeleteModalTrigger extends React.PureComponent {
    static propTypes = {
        onDelete: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        if (this.constructor === DeleteModalTrigger) {
            throw new TypeError('Can not construct abstract class.');
        }

        this.state = {
            showDeleteModal: false,
        };
    }

    handleOpenModal = (e) => {
        e.preventDefault();

        this.setState({
            showDeleteModal: true,
        });
    }

    handleConfirm = () => {
        this.props.onDelete();
    }

    handleCancel = () => {
        this.setState({
            showDeleteModal: false,
        });
    }

    handleKeyDown = (e) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleConfirm(e);
        }
    }

    render() {
        return (
            <span>
                <button
                    className='color--link style--none'
                    onClick={this.handleOpenModal}
                >
                    { this.triggerTitle }
                </button>
                <ConfirmModal
                    show={this.state.showDeleteModal}
                    title={this.modalTitle}
                    message={this.modalMessage}
                    confirmButtonText={this.modalConfirmButton}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleCancel}
                    onKeyDown={this.handleKeyDown}
                />
            </span>
        );
    }
}
