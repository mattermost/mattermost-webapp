// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useIntl} from 'react-intl';

import EditIcon from 'components/widgets/icons/fa_edit_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import {isArchivedChannel} from 'utils/channel_utils';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ToggleModalButton from 'components/toggle_modal_button';
import {ModalIdentifiers, Constants} from 'utils/constants';
import {Channel} from '@mattermost/types/channels';
import {Permissions} from 'mattermost-redux/constants';

type Props = {
    channel: Channel;
}

const SetHeaderButton = ({channel}: Props) => {
    const {formatMessage} = useIntl();

    if (isArchivedChannel(channel)) {
        return null;
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const permissions = isPrivate ? [Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES] : [Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES];

    return (
        <ChannelPermissionGate
            teamId={channel.team_id}
            channelId={channel.id}
            permissions={permissions}
        >
            <ToggleModalButton
                modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
                aria-label={formatMessage({id: 'intro_messages.setHeader', defaultMessage: 'Set a Header'})}
                className={'intro-links color--link channelIntroButton'}
                dialogType={EditChannelHeaderModal}
                dialogProps={{channel}}
            >
                <EditIcon/>
                {formatMessage({id: 'intro_messages.setHeader', defaultMessage: 'Set a Header'})}
            </ToggleModalButton>
        </ChannelPermissionGate>
    );
};

export default React.memo(SetHeaderButton);
