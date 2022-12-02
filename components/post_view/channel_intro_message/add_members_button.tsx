// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useSelector} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import {EmailOutlineIcon} from '@mattermost/compass-icons/components';

import {Channel} from '@mattermost/types/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Permissions} from 'mattermost-redux/constants';

import ToggleModalButton from 'components/toggle_modal_button';
import InvitationModal from 'components/invitation_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import './add_members_button.scss';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

export interface AddMembersButtonProps {
    totalUsers?: number;
    usersLimit: number;
    channel: Channel;
    setHeader?: React.ReactNode;
    createBoard?: React.ReactNode;
}

const AddMembersButton: React.FC<AddMembersButtonProps> = ({totalUsers, usersLimit, channel, setHeader, createBoard}: AddMembersButtonProps) => {
    const currentTeamId = useSelector(getCurrentTeamId);

    if (!totalUsers) {
        return (<LoadingSpinner/>);
    }
    const inviteUsers = totalUsers < usersLimit;

    return (
        <TeamPermissionGate
            teamId={currentTeamId}
            permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
        >
            {inviteUsers ? (
                <LessThanMaxFreeUsers
                    createBoard={createBoard}
                    setHeader={setHeader}
                />
            ) : (
                <MoreThanMaxFreeUsers
                    channel={channel}
                    createBoard={createBoard}
                    setHeader={setHeader}
                />
            )}
        </TeamPermissionGate>
    );
};

const LessThanMaxFreeUsers = ({createBoard}: {setHeader: React.ReactNode; createBoard: React.ReactNode}) => {
    const {formatMessage} = useIntl();

    return (
        <>
            {createBoard}
            <div className='LessThanMaxFreeUsers'>
                <div className='titleAndButton'>
                    <ToggleModalButton
                        ariaLabel={localizeMessage('intro_messages.inviteOthers', 'Invite others to the workspace')}
                        id='introTextInvite'
                        className='intro-links padding-extra color--link cursor--pointer'
                        modalId={ModalIdentifiers.INVITATION}
                        dialogType={InvitationModal}
                    >
                        <EmailOutlineIcon
                            size={14}
                            css={{marginRight: 7}}
                            color={'white'}
                            title={formatMessage({id: 'generic_icons.add', defaultMessage: 'Add Icon'})}
                        />
                        <FormattedMessage
                            id='intro_messages.inviteOthersToWorkspace.button'
                            defaultMessage='Invite others to workspace'
                        />
                    </ToggleModalButton>
                </div>
            </div>
        </>
    );
};

const MoreThanMaxFreeUsers = ({channel, setHeader, createBoard}: {channel: Channel; setHeader: React.ReactNode; createBoard: React.ReactNode}) => {
    const {formatMessage} = useIntl();

    const modalId = channel.group_constrained ? ModalIdentifiers.ADD_GROUPS_TO_CHANNEL : ModalIdentifiers.CHANNEL_INVITE;
    const modal = channel.group_constrained ? AddGroupsToChannelModal : ChannelInviteModal;
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    return (
        <div className='MoreThanMaxFreeUsersWrapper'>
            <div className='MoreThanMaxFreeUsers'>
                <ChannelPermissionGate
                    channelId={channel.id}
                    teamId={channel.team_id}
                    permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                >
                    <ToggleModalButton
                        className='intro-links padding-extra color--link'
                        modalId={modalId}
                        dialogType={modal}
                        dialogProps={{channel}}
                    >
                        <EmailOutlineIcon
                            size={14}
                            css={{marginRight: 7}}
                            color={'white'}
                            title={formatMessage({id: 'generic_icons.add', defaultMessage: 'Add Icon'})}
                        />
                        {isPrivate && channel.group_constrained &&
                            <FormattedMessage
                                id='intro_messages.inviteGropusToChannel.button'
                                defaultMessage='Add groups to this private channel'
                            />}
                        {isPrivate && !channel.group_constrained &&
                            <FormattedMessage
                                id='intro_messages.inviteMembersToPrivateChannel.button'
                                defaultMessage='Add members to this private channel'
                            />}
                        {!isPrivate &&
                            <FormattedMessage
                                id='intro_messages.inviteMembersToChannel.button'
                                defaultMessage='Add members to this channel'
                            />}
                    </ToggleModalButton>
                </ChannelPermissionGate>
            </div>
            {createBoard}
            {setHeader}
        </div>
    );
};

export default React.memo(AddMembersButton);
