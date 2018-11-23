// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import DeleteChannelModal from 'components/delete_channel_modal';
import {Constants, ModalIdentifiers} from 'utils/constants';

const DeleteChannel = ({channel, isDefault, isArchived, penultimateViewedChannelName}) => {
    if (isDefault || isArchived) {
        return null;
    }

    if (channel.type === Constants.DM_CHANNEL) {
        return null;
    }

    if (channel.type === Constants.GM_CHANNEL) {
        return null;
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permission = isPrivate ? Permissions.DELETE_PRIVATE_CHANNEL : Permissions.DELETE_PUBLIC_CHANNEL;

    return (
        <ChannelPermissionGate
            channelId={channel.id}
            teamId={channel.team_id}
            permissions={[permission]}
        >
            <li role='presentation'>
                <ToggleModalButtonRedux
                    role='menuitem'
                    modalId={ModalIdentifiers.DELETE_CHANNEL}
                    dialogType={DeleteChannelModal}
                    dialogProps={{channel, penultimateViewedChannelName}}
                >
                    <FormattedMessage
                        id='channel_header.delete'
                        defaultMessage='Archive Channel'
                    />
                </ToggleModalButtonRedux>
            </li>
        </ChannelPermissionGate>
    );
};

DeleteChannel.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,

    /**
     * Boolean whether the channel is readonly
     */
    isDefault: PropTypes.bool.isRequired,

    /**
     * Boolean whether the channel is readonly
     */
    isArchived: PropTypes.bool.isRequired,

    penultimateViewedChannelName: PropTypes.string.isRequired,
};

export default DeleteChannel;
