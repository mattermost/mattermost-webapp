// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import {Constants, ModalIdentifiers} from 'utils/constants';

const SetChannelPurpose = ({channel, isArchived, isReadonly}) => {
    if (isArchived) {
        return null;
    }

    if (isReadonly) {
        return null;
    }

    if (channel.type === Constants.DM_CHANNEL) {
        return null;
    }

    if (channel.type === Constants.GM_CHANNEL) {
        return null;
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permission = isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES;

    return (
        <ChannelPermissionGate
            channelId={channel.id}
            teamId={channel.team_id}
            permissions={[permission]}
        >
            <li role='presentation'>
                <ToggleModalButtonRedux
                    role='menuitem'
                    modalId={ModalIdentifiers.EDIT_CHANNEL_PURPOSE}
                    dialogType={EditChannelPurposeModal}
                    dialogProps={{channel}}
                >
                    <FormattedMessage
                        id='channel_header.setPurpose'
                        defaultMessage='Edit Channel Purpose'
                    />
                </ToggleModalButtonRedux>
            </li>
        </ChannelPermissionGate>
    );
};

SetChannelPurpose.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,

    /**
     * Boolean whether the channel is readonly
     */
    isArchived: PropTypes.bool.isRequired,

    /**
     * Boolean whether the channel is readonly
     */
    isReadonly: PropTypes.bool.isRequired,
};

export default SetChannelPurpose;
