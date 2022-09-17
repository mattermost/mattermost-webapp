// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {defineMessages, FormattedMessage, useIntl} from 'react-intl';

import {useSelector} from 'react-redux';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Permissions} from 'mattermost-redux/constants';

import EmptyStateThemeableSvg from 'components/common/svg_images_components/empty_state_themeable_svg';
import ToggleModalButton from 'components/toggle_modal_button';
import InvitationModal from 'components/invitation_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {t} from 'utils/i18n';
import {isArchivedChannel} from 'utils/channel_utils';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import './add_members_button.scss';

import SetHeaderButton from '../set_header_button';
import BoardsButton from '../boards_button';
import {Channel} from '@mattermost/types/channels';

export interface AddMembersButtonProps {
    totalUsers?: number;
    usersLimit: number;
    channel: Channel;
    showSetHeader: boolean;
    showBoardsButton: boolean;
}

const messages = defineMessages({
    inviteGroupsToChannelButton: {
        id: t('intro_messages.inviteGroupsToChannel.button'),
        defaultMessage: 'Add groups to this private channel',
    },
    inviteMembersToPrivateChannelButton: {
        id: t('intro_messages.inviteMembersToPrivateChannel.button'),
        defaultMessage: 'Add members to this private channel',
    },
    inviteMembersToChannelButton: {
        id: t('intro_messages.inviteMembersToChannel.button'),
        defaultMessage: 'Add members to this channel',
    },
    inviteOthersToWorkspaceButton: {
        id: t('intro_messages.inviteOthersToWorkspace.button'),
        defaultMessage: 'Invite others to the workspace',
    },
    inviteOthersToWorkspaceTitle: {
        id: t('intro_messages.inviteOthersToWorkspace.title'),
        defaultMessage: 'Let’s add some people to the workspace!',
    },
});

const AddMembersButton = ({totalUsers, usersLimit, channel, showSetHeader, showBoardsButton}: AddMembersButtonProps) => {
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
                <>
                    {showBoardsButton && <BoardsButton/>}
                    {showSetHeader && <SetHeaderButton/>}
                    <LessThanMaxFreeUsers/>
                </>
            ) : (
                <div className='MoreThanMaxFreeUsersWrapper'>
                    <MoreThanMaxFreeUsers channel={channel}/>
                    {showBoardsButton && <BoardsButton/>}
                    {showSetHeader && <SetHeaderButton/>}
                </div>
            )}
        </TeamPermissionGate>
    );
};

const LessThanMaxFreeUsers = () => {
    const {formatMessage} = useIntl();

    return (
        <div className='LessThanMaxFreeUsers'>
            <EmptyStateThemeableSvg
                width={128}
                height={113}
            />
            <div className='titleAndButton'>
                <FormattedMessage {...messages.inviteOthersToWorkspaceTitle}/>
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
                    <FormattedMessage {...messages.inviteOthersToWorkspaceButton}/>
                </ToggleModalButton>
            </div>
        </div>
    );
};

const MoreThanMaxFreeUsers = ({channel}: {channel: Channel}) => {
    const {formatMessage} = useIntl();

    const modalId = channel.group_constrained ? ModalIdentifiers.ADD_GROUPS_TO_CHANNEL : ModalIdentifiers.CHANNEL_INVITE;
    const modal = channel.group_constrained ? AddGroupsToChannelModal : ChannelInviteModal;
    if (isArchivedChannel(channel)) {
        return null;
    }
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    return (
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
                        <FormattedMessage {...messages.inviteGroupsToChannelButton}/>
                    }
                    {isPrivate && !channel.group_constrained &&
                    <FormattedMessage
                        {...messages.inviteMembersToPrivateChannelButton}
                    />}
                    {!isPrivate &&
                        <FormattedMessage {...messages.inviteMembersToChannelButton}/>
                    }
                </ToggleModalButton>
            </ChannelPermissionGate>
        </div>
    );
};

export default React.memo(AddMembersButton);
