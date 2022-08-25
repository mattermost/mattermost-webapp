// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {Permissions} from 'mattermost-redux/constants';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import {t} from 'utils/i18n';
import {Constants, ModalIdentifiers} from 'utils/constants';
import ToggleModalButton from 'components/toggle_modal_button';

import LocalizedIcon from 'components/localized_icon';
import {Channel} from '@mattermost/types/channels';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import {PluginComponent} from 'types/store/plugins';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import AddMembersButton from '../add_members_button';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    stats: any;
    usersLimit: number;
    boardComponent?: PluginComponent;
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    teamIsGroupConstrained?: boolean;
}

const DefaultIntroMessage = ({
    channel,
    stats,
    usersLimit,
    boardComponent,
    enableUserCreation,
    isReadOnly,
    teamIsGroupConstrained,
}: Props) => {
    let teamInviteLink = null;
    const totalUsers = stats.total_users_count;
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    let setHeaderButton = null;
    let boardCreateButton = null;
    if (!isReadOnly) {
        boardCreateButton = (
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
    }

    if (!isReadOnly && enableUserCreation) {
        teamInviteLink = (
            <TeamPermissionGate
                teamId={channel.team_id}
                permissions={[Permissions.INVITE_USER]}
            >
                <TeamPermissionGate
                    teamId={channel.team_id}
                    permissions={[Permissions.ADD_USER_TO_TEAM]}
                >
                    {!teamIsGroupConstrained &&
                        <AddMembersButton
                            setHeader={setHeaderButton}
                            totalUsers={totalUsers}
                            usersLimit={usersLimit}
                            channel={channel}
                            createBoard={boardCreateButton}
                        />
                    }
                    {teamIsGroupConstrained &&
                    <ToggleModalButton
                        className='intro-links color--link'
                        modalId={ModalIdentifiers.ADD_GROUPS_TO_TEAM}
                        dialogType={AddGroupsToTeamModal}
                        dialogProps={{channel}}
                    >
                        {/* MM-46602: convert to compass icon after localization is added */}
                        <LocalizedIcon
                            className='fa fa-user-plus'
                            title={{id: t('generic_icons.add'), defaultMessage: 'Add Icon'}}
                        />
                        <FormattedMessage
                            id='intro_messages.addGroupsToTeam'
                            defaultMessage='Add other groups to this team'
                        />
                    </ToggleModalButton>
                    }
                </TeamPermissionGate>
            </TeamPermissionGate>
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
                {!isReadOnly &&
                    <FormattedMarkdownMessage
                        id='intro_messages.default'
                        defaultMessage='**Welcome to {display_name}!**\n \nPost messages here that you want everyone to see. Everyone automatically becomes a permanent member of this channel when they join the team.'
                        values={{
                            display_name: channel.display_name,
                        }}
                    />
                }
                {isReadOnly &&
                    <FormattedMarkdownMessage
                        id='intro_messages.readonly.default'
                        defaultMessage='**Welcome to {display_name}!**\n \nMessages can only be posted by system admins. Everyone automatically becomes a permanent member of this channel when they join the team.'
                        values={{
                            display_name: channel.display_name,
                        }}
                    />
                }
            </p>
            {teamInviteLink}
            {teamIsGroupConstrained && boardCreateButton}
            {teamIsGroupConstrained && setHeaderButton}
            <br/>
        </>
    );
};

export default React.memo(DefaultIntroMessage);
