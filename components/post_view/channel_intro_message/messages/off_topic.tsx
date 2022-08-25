// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Permissions} from 'mattermost-redux/constants';

import {Constants} from 'utils/constants';

import {Channel} from '@mattermost/types/channels';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import {PluginComponent} from 'types/store/plugins';
import AddMembersButton from '../add_members_button';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    stats: any;
    usersLimit: number;
    boardComponent?: PluginComponent;
}

const OffTopicIntroMessage = ({
    channel,
    stats,
    usersLimit,
    boardComponent,
}: Props) => {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const boardCreateButton = (
        <BoardsButton
            channel={channel}
            boardComponent={boardComponent}
        />
    );
    const children = (
        <SetHeaderButton
            channel={channel}
        />
    );
    const totalUsers = stats.total_users_count;

    let setHeaderButton = null;
    if (children) {
        setHeaderButton = (
            <ChannelPermissionGate
                teamId={channel.team_id}
                channelId={channel.id}
                permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
            >
                {children}
            </ChannelPermissionGate>
        );
    }

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                <FormattedMessage
                    id='intro_messages.offTopic'
                    defaultMessage='This is the start of {display_name}, a channel for non-work-related conversations.'
                    values={{
                        display_name: channel.display_name,
                    }}
                />
            </p>
            <AddMembersButton
                setHeader={setHeaderButton}
                totalUsers={totalUsers}
                usersLimit={usersLimit}
                channel={channel}
                createBoard={boardCreateButton}
            />
        </>
    );
};

export default React.memo(OffTopicIntroMessage);
