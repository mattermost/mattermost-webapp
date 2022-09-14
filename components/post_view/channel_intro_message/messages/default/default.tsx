// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';
import {Permissions} from 'mattermost-redux/constants';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import {t} from 'utils/i18n';
import {ModalIdentifiers} from 'utils/constants';
import ToggleModalButton from 'components/toggle_modal_button';
import LocalizedIcon from 'components/localized_icon';
import {Channel} from '@mattermost/types/channels';
import {isArchivedChannel} from 'utils/channel_utils';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import AddMembersButton from '../../add_members_button';
import BoardsButton from '../../boards_button';
import SetHeaderButton from '../../set_header_button';

type Props = {
    channel: Channel;
    usersLimit: number;
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    teamIsGroupConstrained: boolean;
}

const messages = defineMessages({
    readonlyDefault: {
        id: t('intro_messages.readonly.default'),
        defaultMessage: '**Welcome to {display_name}!**\\n \\nMessages can only be posted by system admins. Everyone automatically becomes a permanent member of this channel when they join the team.',
    },
    default: {
        id: t('intro_messages.default'),
        defaultMessage: '**Welcome to {display_name}!**\\n \\nPost messages here that you want everyone to see. Everyone automatically becomes a permanent member of this channel when they join the team.',
    },
    addGroupsToTeam: {
        id: t('intro_messages.addGroupsToTeam'),
        defaultMessage: 'Add other groups to this team',
    },
    beginning: {
        id: t('intro_messages.beginning'),
        defaultMessage: 'Beginning of {name}',
    },

});

const DefaultIntroMessage = ({
    channel,
    usersLimit,
    enableUserCreation,
    isReadOnly,
    teamIsGroupConstrained,
}: Props) => {
    let teamInviteLink = null;
    const renderButtons = !isReadOnly && !isArchivedChannel(channel);

    if (!isReadOnly && enableUserCreation) {
        teamInviteLink = (
            <TeamPermissionGate
                teamId={channel.team_id}
                permissions={[Permissions.INVITE_USER, Permissions.ADD_USER_TO_TEAM]}
            >
                {teamIsGroupConstrained ? (
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
                            {...messages.addGroupsToTeam}
                        />
                    </ToggleModalButton>
                ) : (
                    <AddMembersButton
                        showSetHeader={renderButtons}
                        showBoardsButton={renderButtons}
                        usersLimit={usersLimit}
                    />
                )}
            </TeamPermissionGate>
        );
    }

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    {...messages.beginning}
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                <FormattedMarkdownMessage
                    {...(isReadOnly ? messages.readonlyDefault : messages.default)}
                    values={{
                        display_name: channel.display_name,
                    }}
                />
            </p>
            {teamInviteLink}
            <BoardsButton show={teamIsGroupConstrained}/>
            <SetHeaderButton show={teamIsGroupConstrained}/>
        </>
    );
};

export default React.memo(DefaultIntroMessage);
