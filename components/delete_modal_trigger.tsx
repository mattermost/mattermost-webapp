// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import ConfirmModal from './confirm_modal.jsx';

type Props = {
    onDelete: () => void;
}

type State = {
    showDeleteModal: boolean;
}

export default class DeleteModalTrigger extends React.PureComponent<Props, State>  {  

    constructor(props: Props) {
        super(props);
        if (this.constructor == DeleteModalTrigger) { 
            throw new TypeError('Can not construct abstract class.');
        }

        this.state = {showDeleteModal: false,};
    }

    public handleOpenModal = (e: React.SyntheticEvent) => {
        e.preventDefault();

        //this.setState({showDeleteModal: true,});
        this.setState({showDeleteModal: true,});
    }   

    public handleConfirm = () => {
        this.props.onDelete();
    }

    handleCancel = () => {
        this.setState({showDeleteModal: false,});
    }

    handleKeyDown = (e: React.KeyboardEvent) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleConfirm();
        }
    }


    get triggerTitle():JSX.Element {
        return <div></div>
    }

    get modalTitle():JSX.Element  {
        return <div></div>
    }

    get modalMessage():JSX.Element {
        return <div></div>
    }

    get modalConfirmButton():JSX.Element {
        return <div></div>
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