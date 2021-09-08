// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Permissions} from 'mattermost-redux/constants';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import InvitationModal from 'components/invitation_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import EmptyStateThemeableSvg from 'components/common/svg_images_components/empty_state_themeable.svg';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import './add_members_button.scss';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

export interface AddMembersButtonProps {
    totalUsers?: number;
    usersLimit: number;
    channel: Channel;
    setHeader: React.ReactNode;
}

const AddMembersButton: React.FC<AddMembersButtonProps> = ({totalUsers, usersLimit, channel, setHeader}: AddMembersButtonProps) => {
    if (!totalUsers) {
        return (<LoadingSpinner/>);
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const inviteUsers = totalUsers < usersLimit;
    const currentTeamId = useSelector(getCurrentTeamId);

    return (
        <TeamPermissionGate
            teamId={currentTeamId}
            permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
        >
            {inviteUsers && !isPrivate ? lessThanMaxFreeUsers(setHeader) : moreThanMaxFreeUsers(channel, setHeader)}
        </TeamPermissionGate>
    );
};

const lessThanMaxFreeUsers = (setHeader: React.ReactNode) => {
    return (
        <>
            {setHeader}
            <div className='LessThanMaxFreeUsers'>
                <EmptyStateThemeableSvg
                    width={128}
                    height={113}
                />
                <div className='titleAndButton'>
                    <FormattedMessage
                        id='intro_messages.inviteOthersToWorkspace.title'
                        defaultMessage='Let’s add some people to the workspace!'
                    />
                    <ToggleModalButtonRedux
                        accessibilityLabel={localizeMessage('intro_messages.inviteOthers', 'Invite others to the workspace')}
                        id='introTextInvite'
                        className='intro-links color--link cursor--pointer'
                        modalId={ModalIdentifiers.INVITATION}
                        dialogType={InvitationModal}
                    >
                        <FormattedMessage
                            id='generic_icons.add'
                            defaultMessage='Add Icon'
                        >
                            {(title: string) => (
                                <i
                                    className='icon-email-plus-outline'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
                        <FormattedMessage
                            id='intro_messages.inviteOthersToWorkspace.button'
                            defaultMessage='Invite others to the workspace'
                        />
                    </ToggleModalButtonRedux>
                </div>
            </div>
        </>
    );
};

const moreThanMaxFreeUsers = (channel: Channel, setHeader: React.ReactNode) => {
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
                        className='intro-links color--link'
                        dialogType={modal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='generic_icons.add'
                            defaultMessage='Add Icon'
                        >
                            {(title: string) => (
                                <i
                                    className='icon-account-plus-outline'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
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
            {setHeader}
        </div>
    );
};

export default React.memo(AddMembersButton);
