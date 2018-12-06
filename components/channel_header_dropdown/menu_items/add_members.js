// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelInviteModal from 'components/channel_invite_modal';
import {Constants, ModalIdentifiers} from 'utils/constants';

const AddMembers = ({channel, isDefault, isArchived}) => {
    if (isDefault) {
        return null;
    }

    if (isArchived) {
        return null;
    }

    if (channel.type === Constants.DM_CHANNEL) {
        return null;
    }

    if (channel.type === Constants.GM_CHANNEL) {
        return null;
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permission = isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS;

    return (
        <ChannelPermissionGate
            channelId={channel.id}
            teamId={channel.team_id}
            permissions={[permission]}
        >
            <li role='presentation'>
                <ToggleModalButtonRedux
                    role='menuitem'
                    modalId={ModalIdentifiers.CHANNEL_INVITE}
                    dialogType={ChannelInviteModal}
                    dialogProps={{channel}}
                >
                    <FormattedMessage
                        id='navbar.addMembers'
                        defaultMessage='Add Members'
                    />
                </ToggleModalButtonRedux>
            </li>
        </ChannelPermissionGate>
    );
};

AddMembers.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,

    /**
     * Boolean whether the channel is default channel
     */
    isDefault: PropTypes.bool.isRequired,

    /**
     * Boolean whether the channel is archived
     */
    isArchived: PropTypes.bool.isRequired,
};

export default AddMembers;
