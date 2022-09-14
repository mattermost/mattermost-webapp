// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useSelector} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import EmptyStateThemeableSvg from 'components/common/svg_images_components/empty_state_themeable_svg';

import {Channel} from '@mattermost/types/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Permissions} from 'mattermost-redux/constants';

import ToggleModalButton from 'components/toggle_modal_button';
import InvitationModal from 'components/invitation_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import {isArchivedChannel} from 'utils/channel_utils';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import './add_members_button.scss';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import SetHeaderButton from '../set_header_button';
import BoardsButton from '../boards_button';

export interface AddMembersButtonProps {
    totalUsers?: number;
    usersLimit: number;
    channel: Channel;
    showSetHeader: boolean;
    showBoardsButton: boolean;
}

const AddMembersButton: React.FC<AddMembersButtonProps> = ({totalUsers, usersLimit, channel, showSetHeader, showBoardsButton}: AddMembersButtonProps) => {
    const currentTeamId = useSelector(getCurrentTeamId);

    if (!totalUsers) {
        return (<LoadingSpinner/>);
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const inviteUsers = totalUsers < usersLimit;

    return (
        <TeamPermissionGate
            teamId={currentTeamId}
            permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
        >
            {inviteUsers && !isPrivate ? (
                <LessThanMaxFreeUsers
                    showBoardsButton={showBoardsButton}
                    showSetHeader={showSetHeader}
                />
            ) : (
                <MoreThanMaxFreeUsers
                    channel={channel}
                    showBoardsButton={showBoardsButton}
                    showSetHeader={showSetHeader}
                />
            )}
        </TeamPermissionGate>
    );
};

const LessThanMaxFreeUsers = ({showSetHeader, showBoardsButton}: {showSetHeader: boolean; showBoardsButton: boolean}) => {
    const {formatMessage} = useIntl();

    return (
        <>
            {showBoardsButton && <BoardsButton/>}
            <SetHeaderButton show={showSetHeader}/>
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
                    <ToggleModalButton
                        ariaLabel={localizeMessage('intro_messages.inviteOthers', 'Invite others to the workspace')}
                        id='introTextInvite'
                        className='intro-links color--link cursor--pointer'
                        modalId={ModalIdentifiers.INVITATION}
                        dialogType={InvitationModal}
                    >
                        <i
                            className='icon-email-plus-outline'
                            title={formatMessage({id: 'generic_icons.add', defaultMessage: 'Add Icon'})}
                        />
                        <FormattedMessage
                            id='intro_messages.inviteOthersToWorkspace.button'
                            defaultMessage='Invite others to the workspace'
                        />
                    </ToggleModalButton>
                </div>
            </div>
        </>
    );
};

const MoreThanMaxFreeUsers = ({channel, showSetHeader, showBoardsButton}: {channel: Channel; showSetHeader: boolean; showBoardsButton: boolean}) => {
    const {formatMessage} = useIntl();

    const modalId = channel.group_constrained ? ModalIdentifiers.ADD_GROUPS_TO_CHANNEL : ModalIdentifiers.CHANNEL_INVITE;
    const modal = channel.group_constrained ? AddGroupsToChannelModal : ChannelInviteModal;
    if (isArchivedChannel(channel)) {
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
                        modalId={modalId}
                        dialogType={modal}
                        dialogProps={{channel}}
                    >
                        <i
                            className='icon-account-plus-outline'
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
            {showBoardsButton && <BoardsButton/>}
            <SetHeaderButton show={showSetHeader}/>
        </div>
    );
};

export default React.memo(AddMembersButton);
