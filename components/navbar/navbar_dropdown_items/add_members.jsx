// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';
import {isDefault} from 'mattermost-redux/utils/channel_utils';

import {Constants, ModalIdentifiers} from 'utils/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import MoreDirectChannelsModal from 'components/more_direct_channels';
import ChannelInviteModal from 'components/channel_invite_modal';

const AddMembersOptionMessage = () => (
    <FormattedMessage
        id='navbar.addMembers'
        defaultMessage='Add Members'
    />
);

const AddMembersOption = ({channel}) => {
    if (isDefault(channel)) {
        return null;
    }

    let permission;
    switch (channel.type) {
    case Constants.GM_CHANNEL:
        return (
            <li role='presentation'>
                <ToggleModalButtonRedux
                    id='channelAddMembersGroup'
                    role='menuitem'
                    modalId={ModalIdentifiers.CREATE_DM_CHANNEL}
                    dialogType={MoreDirectChannelsModal}
                    dialogProps={{isExistingChannel: true}}
                >
                    <AddMembersOptionMessage/>
                </ToggleModalButtonRedux>
            </li>
        );

    case Constants.OPEN_CHANNEL:
        permission = Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS;
        break;

    case Constants.PRIVATE_CHANNEL:
        permission = Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS;
        break;

    default:
        return null;
    }

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
                    <AddMembersOptionMessage/>
                </ToggleModalButtonRedux>
            </li>
        </ChannelPermissionGate>
    );
};

AddMembersOption.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,
};

export default AddMembersOption;
