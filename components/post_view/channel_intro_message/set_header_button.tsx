// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import EditIcon from 'components/widgets/icons/fa_edit_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ToggleModalButton from 'components/toggle_modal_button';
import {ModalIdentifiers, Constants} from 'utils/constants';
import {Channel} from '@mattermost/types/channels';
import {Permissions} from 'mattermost-redux/constants';
import * as Utils from 'utils/utils';

type Props = {
    channel: Channel;
}

const SetHeaderButton = ({channel}: Props): (React.ReactElement | null) => {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }

    const permissions = channel.type === Constants.PRIVATE_CHANNEL ? [Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES] : [Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES];

    const toggleButton = (
        <ToggleModalButton
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            ariaLabel={Utils.localizeMessage('intro_messages.setHeader', 'Set a Header')}
            className={'intro-links color--link channelIntroButton'}
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <EditIcon/>
            <FormattedMessage
                id='intro_messages.setHeader'
                defaultMessage='Set a Header'
            />
        </ToggleModalButton>
    );

    return permissions ? (
        <ChannelPermissionGate
            teamId={channel.team_id}
            channelId={channel.id}
            permissions={permissions}
        >
            {toggleButton}
        </ChannelPermissionGate>
    ) : toggleButton;
};

export default React.memo(SetHeaderButton);
