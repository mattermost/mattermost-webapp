// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import {Constants, ModalIdentifiers} from 'utils/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import RenameChannelModal from 'components/rename_channel_modal';

const RenameChannelOption = ({channel}) => {
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
                    modalId={ModalIdentifiers.RENAME_CHANNEL}
                    dialogType={RenameChannelModal}
                    dialogProps={{channel}}
                >
                    <FormattedMessage
                        id='channel_header.rename'
                        defaultMessage='Rename Channel'
                    />
                </ToggleModalButtonRedux>
            </li>
        </ChannelPermissionGate>
    );
};

RenameChannelOption.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,
};

export default RenameChannelOption;
