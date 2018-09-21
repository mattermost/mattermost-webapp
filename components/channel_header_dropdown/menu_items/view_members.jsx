// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelMembersModal from 'components/channel_members_modal';
import {Constants, ModalIdentifiers} from 'utils/constants';

const ViewMembers = ({channel, isDefault}) => {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permission = isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS;
    const menuitem = (
        <li role='presentation'>
            <ToggleModalButtonRedux
                role='menuitem'
                modalId={ModalIdentifiers.CHANNEL_MEMBERS}
                dialogType={ChannelMembersModal}
                dialogProps={{channel}}
            >
                <FormattedMessage
                    id='channel_header.viewMembers'
                    defaultMessage='View Members'
                />
            </ToggleModalButtonRedux>
        </li>
    );

    return isDefault ? menuitem : (
        <ChannelPermissionGate
            channelId={channel.id}
            teamId={channel.team_id}
            permissions={[permission]}
            invert={true}
        >
            {menuitem}
        </ChannelPermissionGate>
    );
};

ViewMembers.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,

    /**
     * Boolean whether the channel is default channel
     */
    isDefault: PropTypes.bool.isRequired,
};

export default ViewMembers;
