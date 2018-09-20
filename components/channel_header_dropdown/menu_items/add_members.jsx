// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import MoreDirectChannelsModal from 'components/more_direct_channels';
import ChannelInviteModal from 'components/channel_invite_modal';
import {Constants, ModalIdentifiers} from 'utils/constants';

const AddMembers = ({channel, isDefault}) => {
    if (isDefault) {
        return null;
    }

    const message = (
        <FormattedMessage
            id='navbar.addMembers'
            defaultMessage='Add Members'
        />
    );

    switch (channel.type) {
    case Constants.OPEN_CHANNEL:
        return (
            <ChannelPermissionGate
                channelId={channel.id}
                teamId={channel.team_id}
                permissions={[Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
            >
                <li role='presentation'>
                    <ToggleModalButtonRedux
                        role='menuitem'
                        modalId={ModalIdentifiers.CHANNEL_INVITE}
                        dialogType={ChannelInviteModal}
                        dialogProps={{channel}}
                    >
                        {message}
                    </ToggleModalButtonRedux>
                </li>
            </ChannelPermissionGate>
        );

    case Constants.PRIVATE_CHANNEL:
        return (
            <ChannelPermissionGate
                channelId={channel.id}
                teamId={channel.team_id}
                permissions={[Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]}
            >
                <li role='presentation'>
                    <ToggleModalButtonRedux
                        role='menuitem'
                        modalId={ModalIdentifiers.CHANNEL_INVITE}
                        dialogType={ChannelInviteModal}
                        dialogProps={{channel}}
                    >
                        {message}
                    </ToggleModalButtonRedux>
                </li>
            </ChannelPermissionGate>
        );

    case Constants.GM_CHANNEL:
        return (
            <li role='presentation'>
                <ToggleModalButtonRedux
                    role='menuitem'
                    modalId={ModalIdentifiers.CREATE_DM_CHANNEL}
                    dialogType={MoreDirectChannelsModal}
                    dialogProps={{isExistingChannel: true}}
                >
                    {message}
                </ToggleModalButtonRedux>
            </li>
        );
    default:
        return null;
    }
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
};

export default AddMembers;
