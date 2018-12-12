// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import {Constants, ModalIdentifiers} from 'utils/constants';

const SetChannelHeader = ({channel, isArchived, isReadonly}) => {
    if (isArchived) {
        return null;
    }

    if (isReadonly) {
        return null;
    }

    let menuItem = (
        <li role='presentation'>
            <ToggleModalButtonRedux
                id='channelEditHeader'
                role='menuitem'
                modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
                dialogType={EditChannelHeaderModal}
                dialogProps={{channel}}
            >
                <FormattedMessage
                    id='channel_header.setHeader'
                    defaultMessage='Edit Channel Header'
                />
            </ToggleModalButtonRedux>
        </li>
    );

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permission = isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES;

    if (channel.type !== Constants.DM_CHANNEL && channel.type !== Constants.GM_CHANNEL) {
        menuItem = (
            <ChannelPermissionGate
                channelId={channel.id}
                teamId={channel.team_id}
                permissions={[permission]}
            >
                {menuItem}
            </ChannelPermissionGate>
        );
    }

    return menuItem;
};

SetChannelHeader.propTypes = {

    /**
     * Object with info about user
     */
    channel: PropTypes.object.isRequired,

    /**
     * Boolean whether the channel is archived
     */
    isArchived: PropTypes.bool.isRequired,

    /**
     * Boolean whether the channel is readonly
     */
    isReadonly: PropTypes.bool.isRequired,
};

export default SetChannelHeader;
