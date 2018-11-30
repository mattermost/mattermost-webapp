// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import MemberListChannel from 'components/member_list_channel';
import ChannelInviteModal from 'components/channel_invite_modal';
import {ModalIdentifiers} from 'utils/constants';

export default class ChannelMembersModal extends React.PureComponent {
    static propTypes = {

        /**
         * Bool whether user has permission to manage current channel
         */
        canManageChannelMembers: PropTypes.bool.isRequired,

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * Function that is called when modal is hidden
         */
        onHide: PropTypes.func.isRequired,

        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    handleHide = () => {
        this.setState({
            show: false,
        });
    }

    handleExit = () => {
        this.props.onHide();
    }

    onAddNewMembersButton = () => {
        const {channel, actions} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });

        this.handleExit();
    }

    render() {
        const channelIsArchived = this.props.channel.delete_at !== 0;
        return (
            <div>
                <Modal
                    dialogClassName='more-modal more-modal--action'
                    show={this.state.show}
                    onHide={this.handleHide}
                    onExited={this.handleExit}
                >
                    <Modal.Header closeButton={true}>
                        <Modal.Title>
                            <span className='name'>{this.props.channel.display_name}</span>
                            <FormattedMessage
                                id='channel_members_modal.members'
                                defaultMessage=' Members'
                            />
                        </Modal.Title>
                        {this.props.canManageChannelMembers && !channelIsArchived &&
                            <a
                                id='showInviteModal'
                                className='btn btn-md btn-primary'
                                href='#'
                                onClick={this.onAddNewMembersButton}
                            >
                                <FormattedMessage
                                    id='channel_members_modal.addNew'
                                    defaultMessage=' Add New Members'
                                />
                            </a>
                        }
                    </Modal.Header>
                    <Modal.Body>
                        <MemberListChannel
                            channel={this.props.channel}
                        />
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}
