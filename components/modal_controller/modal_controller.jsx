// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {ModalIdentifiers} from 'utils/constants.jsx';

import DeleteChannelModal from 'components/delete_channel_modal';

export default class ModalController extends React.Component {

    constructor(params) {
        super(params);
    }

    render() {
        const {modals, ...props} = this.props;

        if (!modals) {
            return <div></div>;
        }

        let modalOutput;

        const deleteChannelModal = modals.modalState[ModalIdentifiers.DELETE_CHANNEL];

        if (deleteChannelModal && deleteChannelModal.open) {
            console.log('is open');
            modalOutput = (
                <DeleteChannelModal
                    onHide={props.actions.closeModal.bind(this, ModalIdentifiers.DELETE_CHANNEL)}
                    {...deleteChannelModal.dialogProps}
                />
            );
        }

        return (
            <div>
                {modalOutput}
            </div>
        );
    }
}
