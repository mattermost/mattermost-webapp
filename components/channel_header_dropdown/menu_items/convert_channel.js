// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import {Constants, ModalIdentifiers} from 'utils/constants';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ConvertChannelModal from 'components/convert_channel_modal';

const ConvertChannel = ({channel, isDefault, isArchived}) => {
    if (isDefault || isArchived) {
        return null;
    }

    if (channel.type !== Constants.OPEN_CHANNEL) {
        return null;
    }

    return (
        <TeamPermissionGate
            teamId={channel.team_id}
            permissions={[Permissions.MANAGE_TEAM]}
        >
            <li role='presentation'>
                <ToggleModalButtonRedux
                    role='menuitem'
                    modalId={ModalIdentifiers.CONVERT_CHANNEL}
                    dialogType={ConvertChannelModal}
                    dialogProps={{
                        channelId: channel.id,
                        channelDisplayName: channel.display_name,
                    }}
                >
                    <FormattedMessage
                        id='channel_header.convert'
                        defaultMessage='Convert to Private Channel'
                    />
                </ToggleModalButtonRedux>
            </li>
        </TeamPermissionGate>
    );
};

ConvertChannel.propTypes = {

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
};

export default ConvertChannel;
