// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';
import {isDefault as isDefaultChannel} from 'mattermost-redux/utils/channel_utils';

import {Constants, ModalIdentifiers} from 'utils/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelMembersModal from 'components/channel_members_modal';

const ChannelMembersOption = ({channel}) => {
    const isDefault = isDefaultChannel(channel);
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permission = isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS;
    const viewChannelMembers = (
        <FormattedMessage
            id='channel_header.viewMembers'
            defaultMessage='View Members'
        />
    );
    const viewOrManageChannelMembers = (
        <React.Fragment>
            <ChannelPermissionGate
                channelId={channel.id}
                teamId={channel.team_id}
                permissions={[permission]}
            >
                <FormattedMessage
                    id='channel_header.manageMembers'
                    defaultMessage='Manage Members'
                />
            </ChannelPermissionGate>
            <ChannelPermissionGate
                channelId={channel.id}
                teamId={channel.team_id}
                permissions={[permission]}
                invert={true}
            >
                {viewChannelMembers}
            </ChannelPermissionGate>
        </React.Fragment>
    );

    return (
        <li role='presentation'>
            <ToggleModalButtonRedux
                role='menuitem'
                modalId={ModalIdentifiers.CHANNEL_MEMBERS}
                dialogType={ChannelMembersModal}
                dialogProps={{channel}}
            >
                {isDefault ? viewChannelMembers : viewOrManageChannelMembers}
            </ToggleModalButtonRedux>
        </li>
    );
};

ChannelMembersOption.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,
};

export default ChannelMembersOption;
