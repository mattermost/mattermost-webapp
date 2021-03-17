// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedDate, FormattedMessage} from 'react-intl';

import {Permissions} from 'mattermost-redux/constants';

import {UserProfile as UserProfileRedux} from 'mattermost-redux/types/users';

import {Channel} from 'mattermost-redux/types/channels';

import React from 'react';

import {Constants, ModalIdentifiers} from 'utils/constants';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ProfilePicture from 'components/profile_picture';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import UserProfile from 'components/user_profile';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import EditIcon from 'components/widgets/icons/fa_edit_icon';
import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {getMonthLong} from 'utils/i18n.jsx';
import * as Utils from 'utils/utils.jsx';

import AddMembersButton from './add_members_button';

type Props = {
    currentUserId: string;
    channel: Channel;
    fullWidth: boolean;
    locale: string;
    channelProfiles: UserProfileRedux[];
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    teamIsGroupConstrained?: boolean;
    creatorName: string;
    teammate: UserProfileRedux;
    teammateName?: string;
    stats: any;
    theme: any;
    usersLimit: number;
}

export default class ChannelIntroMessage extends React.PureComponent<Props> {
    render() {
        const {
            currentUserId,
            channel,
            creatorName,
            fullWidth,
            locale,
            enableUserCreation,
            isReadOnly,
            channelProfiles,
            teamIsGroupConstrained,
            teammate,
            teammateName,
            stats,
            usersLimit,
            theme,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return createDMIntroMessage(channel, centeredIntro, teammate, teammateName);
        } else if (channel.type === Constants.GM_CHANNEL) {
            return createGMIntroMessage(channel, centeredIntro, channelProfiles, currentUserId);
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return createDefaultIntroMessage(channel, centeredIntro, stats, usersLimit, theme, enableUserCreation, isReadOnly, teamIsGroupConstrained);
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return createOffTopicIntroMessage(channel, centeredIntro, stats, usersLimit, theme);
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return createStandardIntroMessage(channel, centeredIntro, theme, stats, usersLimit, locale, creatorName);
        }
        return null;
    }
}

function createGMIntroMessage(channel: Channel, centeredIntro: string, profiles: UserProfileRedux[], currentUserId: string) {
    const channelIntroId = 'channelIntro';

    if (profiles.length > 0) {
        const pictures = profiles.
            filter((profile) => profile.id !== currentUserId).
            map((profile) => (
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile.id, profile.last_picture_update)}
                    size='xl'
                    userId={profile.id}
                    username={profile.username}
                />
            ));

        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    {pictures}
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.GM'
                        defaultMessage='This is the start of your group message history with {names}.\nMessages and files shared here are not shown to people outside this area.'
                        values={{
                            names: channel.display_name,
                        }}
                    />
                </p>
                {createSetHeaderButton(channel)}
            </div>
        );
    }

    return (
        <div
            id={channelIntroId}
            className={'channel-intro ' + centeredIntro}
        >
            <p className='channel-intro-text'>
                <FormattedMessage
                    id='intro_messages.group_message'
                    defaultMessage='This is the start of your group message history with these teammates. Messages and files shared here are not shown to people outside this area.'
                />
            </p>
        </div>
    );
}

function createDMIntroMessage(channel: Channel, centeredIntro: string, teammate: UserProfileRedux, teammateName?: string) {
    const channelIntroId = 'channelIntro';
    if (teammate) {
        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    <ProfilePicture
                        src={Utils.imageURLForUser(teammate.id, teammate.last_picture_update)}
                        size='xl'
                        userId={teammate.id}
                        username={teammate.username}
                        hasMention={true}
                    />
                </div>
                <div className='channel-intro-profile d-flex'>
                    <UserProfile
                        userId={teammate.id}
                        disablePopover={false}
                        hasMention={true}
                    />
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.DM'
                        defaultMessage='This is the start of your direct message history with {teammate}.\nDirect messages and files shared here are not shown to people outside this area.'
                        values={{
                            teammate: teammateName,
                        }}
                    />
                </p>
                {teammate.is_bot ? null : createSetHeaderButton(channel)}
            </div>
        );
    }

    return (
        <div
            id={channelIntroId}
            className={'channel-intro ' + centeredIntro}
        >
            <p className='channel-intro-text'>
                <FormattedMessage
                    id='intro_messages.teammate'
                    defaultMessage='This is the start of your direct message history with this teammate. Direct messages and files shared here are not shown to people outside this area.'
                />
            </p>
        </div>
    );
}

function createOffTopicIntroMessage(channel: Channel, centeredIntro: string, stats: any, usersLimit: number, theme: any) {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const children = createSetHeaderButton(channel);
    let totalUsers = 0;
    if (stats && (typeof stats.TOTAL_USERS === 'number')) {
        totalUsers = stats.TOTAL_USERS;
    }
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

    const channelInviteButton = (
        <AddMembersButton
            setHeader={setHeaderButton}
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            theme={theme}
        />
    );

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
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
            {channelInviteButton}
        </div>
    );
}

export function createDefaultIntroMessage(
    channel: Channel,
    centeredIntro: string,
    stats: any,
    usersLimit: number,
    theme: any,
    enableUserCreation?: boolean,
    isReadOnly?: boolean,
    teamIsGroupConstrained?: boolean,
) {
    let teamInviteLink = null;
    let totalUsers = 0;
    if (stats && (typeof stats.TOTAL_USERS === 'number')) {
        totalUsers = stats.TOTAL_USERS;
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    let setHeaderButton = null;
    if (!isReadOnly) {
        const children = createSetHeaderButton(channel);
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
                            theme={theme}
                        />
                    }
                    {teamIsGroupConstrained &&
                    <ToggleModalButton
                        className='intro-links color--link'
                        dialogType={AddGroupsToTeamModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='generic_icons.add'
                            defaultMessage='Add Icon'
                        >
                            {(title: string) => (
                                <i
                                    className='fa fa-user-plus'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
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
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
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
            {teamIsGroupConstrained && setHeaderButton}
            <br/>
        </div>
    );
}

function createStandardIntroMessage(channel: Channel, centeredIntro: string, theme: any, stats: any, usersLimit: number, locale: string, creatorName: string) {
    const uiName = channel.display_name;
    let memberMessage;
    const channelIsArchived = channel.delete_at !== 0;

    let totalUsers = 0;
    if (stats && (typeof stats.TOTAL_USERS === 'number')) {
        totalUsers = stats.TOTAL_USERS;
    }

    if (channelIsArchived) {
        memberMessage = '';
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        memberMessage = (
            <FormattedMessage
                id='intro_messages.onlyInvited'
                defaultMessage=' Only invited members can see this private channel.'
            />
        );
    } else {
        memberMessage = (
            <FormattedMessage
                id='intro_messages.anyMember'
                defaultMessage=' Any member can join and read this channel.'
            />
        );
    }

    const date = (
        <FormattedDate
            value={channel.create_at}
            month={getMonthLong(locale)}
            day='2-digit'
            year='numeric'
        />
    );

    let createMessage;
    if (creatorName === '') {
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            createMessage = (
                <FormattedMessage
                    id='intro_messages.noCreatorPrivate'
                    defaultMessage='This is the start of the {name} private channel, created on {date}.'
                    values={{name: (uiName), date}}
                />
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            createMessage = (
                <FormattedMessage
                    id='intro_messages.noCreator'
                    defaultMessage='This is the start of the {name} channel, created on {date}.'
                    values={{name: (uiName), date}}
                />
            );
        }
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        createMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.creatorPrivate'
                    defaultMessage='This is the start of the {name} private channel, created by {creator} on {date}.'
                    values={{
                        name: (uiName),
                        creator: (creatorName),
                        date,
                    }}
                />
            </span>
        );
    } else if (channel.type === Constants.OPEN_CHANNEL) {
        createMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.creator'
                    defaultMessage='This is the start of the {name} channel, created by {creator} on {date}.'
                    values={{
                        name: (uiName),
                        creator: (creatorName),
                        date,
                    }}
                />
            </span>
        );
    }

    let purposeMessage;
    if (channel.purpose && channel.purpose !== '') {
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            purposeMessage = (
                <span>
                    <FormattedMessage
                        id='intro_messages.purposePrivate'
                        defaultMessage=" This private channel's purpose is: {purpose}"
                        values={{purpose: channel.purpose}}
                    />
                </span>
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            purposeMessage = (
                <span>
                    <FormattedMessage
                        id='intro_messages.purpose'
                        defaultMessage=" This channel's purpose is: {purpose}"
                        values={{purpose: channel.purpose}}
                    />
                </span>
            );
        }
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    let setHeaderButton = null;
    const children = createSetHeaderButton(channel);
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

    const channelInviteButton = (
        <AddMembersButton
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            setHeader={setHeaderButton}
            theme={theme}
        />
    );

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: (uiName),
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                {createMessage}
                {memberMessage}
                {purposeMessage}
                <br/>
            </p>
            {channelInviteButton}
        </div>
    );
}

function createSetHeaderButton(channel: Channel) {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }

    return (
        <ToggleModalButtonRedux
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            accessibilityLabel={Utils.localizeMessage('intro_messages.setHeader', 'Set a Header')}
            className={'intro-links color--link setHeaderButton'}
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <EditIcon/>
            <FormattedMessage
                id='intro_messages.setHeader'
                defaultMessage='Set a Header'
            />
        </ToggleModalButtonRedux>
    );
}
