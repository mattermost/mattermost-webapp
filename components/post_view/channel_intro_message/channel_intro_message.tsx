// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedDate, FormattedMessage} from 'react-intl';

import React from 'react';

import {Permissions} from 'mattermost-redux/constants';

import {UserProfile as UserProfileRedux} from 'mattermost-redux/types/users';

import {Channel} from 'mattermost-redux/types/channels';

import {Constants, ModalIdentifiers} from 'utils/constants';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ChannelNotificationsModal from 'components/channel_notifications_modal';
import LocalizedIcon from 'components/localized_icon';
import ProfilePicture from 'components/profile_picture';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import UserProfile from 'components/user_profile';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import EditIcon from 'components/widgets/icons/fa_edit_icon';
import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {getMonthLong, t} from 'utils/i18n.jsx';
import * as Utils from 'utils/utils.jsx';
import {PluginComponent} from 'types/store/plugins';

import AddMembersButton from './add_members_button';

type Props = {
    currentUserId: string;
    channel: Channel;
    fullWidth: boolean;
    locale: string;
    channelProfiles: UserProfileRedux[];
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    isFavorite: boolean;
    teamIsGroupConstrained?: boolean;
    creatorName: string;
    teammate?: UserProfileRedux;
    teammateName?: string;
    currentUser: UserProfileRedux;
    stats: any;
    usersLimit: number;
    actions: {
        getTotalUsersStats: () => any;
        favoriteChannel: (channelId: string) => any;
        unfavoriteChannel: (channelId: string) => any;
    };
    boardComponent?: PluginComponent;
}

export default class ChannelIntroMessage extends React.PureComponent<Props> {
    componentDidMount() {
        if (!this.props.stats?.total_users_count) {
            this.props.actions.getTotalUsersStats();
        }
    }

    toggleFavorite = () => {
        if (this.props.isFavorite) {
            this.props.actions.unfavoriteChannel(this.props.channel.id);
        } else {
            this.props.actions.favoriteChannel(this.props.channel.id);
        }
    };

    render() {
        const {
            currentUserId,
            channel,
            creatorName,
            fullWidth,
            locale,
            enableUserCreation,
            isReadOnly,
            isFavorite,
            channelProfiles,
            teamIsGroupConstrained,
            teammate,
            teammateName,
            currentUser,
            stats,
            usersLimit,
            boardComponent,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return createDMIntroMessage(channel, centeredIntro, isFavorite, this.toggleFavorite, teammate, teammateName, boardComponent);
        } else if (channel.type === Constants.GM_CHANNEL) {
            return createGMIntroMessage(channel, centeredIntro, channelProfiles, currentUserId, currentUser, boardComponent);
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return createDefaultIntroMessage(channel, centeredIntro, stats, usersLimit, enableUserCreation, isReadOnly, teamIsGroupConstrained, boardComponent);
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return createOffTopicIntroMessage(channel, centeredIntro, stats, usersLimit, boardComponent);
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return createStandardIntroMessage(channel, centeredIntro, stats, usersLimit, currentUser, locale, creatorName, boardComponent);
        }
        return null;
    }
}

function createGMIntroMessage(channel: Channel, centeredIntro: string, profiles: UserProfileRedux[], currentUserId: string, currentUser: UserProfileRedux, boardComponent?: PluginComponent) {
    const channelIntroId = 'channelIntro';

    if (profiles.length > 0) {
        const pictures = profiles.
            filter((profile) => profile.id !== currentUserId).
            map((profile) => (
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile.id, profile.last_picture_update)}
                    size='xxl'
                    userId={profile.id}
                    username={profile.username}
                />
            ));
        return (
            <div
                id={channelIntroId}
                className={'channel-intro d-flex flex-column ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    {pictures}
                </div>
                <div className='channel-intro-display-name'>
                    {channel.display_name}
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
                <div className='d-flex flex-row'>
                    {createBoardsButton(channel, boardComponent)}
                    {createSetHeaderButton(channel)}
                    {createNotificationButton(channel, currentUser)}
                </div>
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

function createDMIntroMessage(channel: Channel, centeredIntro: string, isFavorite: boolean, toggleFavorite: () => void, teammate?: UserProfileRedux, teammateName?: string, boardComponent?: PluginComponent) {
    const channelIntroId = 'channelIntro';
    if (teammate) {
        const src = teammate ? Utils.imageURLForUser(teammate.id, teammate.last_picture_update) : '';
        let setHeaderButton = null;
        let boardCreateButton = null;
        if (!teammate?.is_bot) {
            boardCreateButton = createBoardsButton(channel, boardComponent);
            setHeaderButton = createSetHeaderButton(channel);
        }

        return (
            <div
                id={channelIntroId}
                className={'channel-intro d-flex flex-column ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    <ProfilePicture
                        src={src}
                        size='xxl'
                        userId={teammate?.id}
                        username={teammate?.username}
                        hasMention={true}
                        status={teammate.is_bot ? '' : channel.status}
                    />
                </div>
                <div className='channel-intro-profile'>
                    <UserProfile
                        userId={teammate?.id}
                        disablePopover={false}
                        hasMention={true}
                    />
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.DM'
                        defaultMessage='This is the start of your conversation with {teammate}.\nMessages and files shared here are not shown to anyone else.'
                        values={{
                            teammate: teammateName,
                        }}
                    />
                </p>
                <div className='d-flex flex-row'>
                    {boardCreateButton}
                    {setHeaderButton}
                    {createFavoriteButton(isFavorite, toggleFavorite)}
                </div>
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

function createOffTopicIntroMessage(channel: Channel, centeredIntro: string, stats: any, usersLimit: number, boardComponent?: PluginComponent) {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const boardCreateButton = createBoardsButton(channel, boardComponent);
    const children = createSetHeaderButton(channel);
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

    const channelInviteButton = (
        <AddMembersButton
            setHeader={setHeaderButton}
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            createBoard={boardCreateButton}
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
    enableUserCreation?: boolean,
    isReadOnly?: boolean,
    teamIsGroupConstrained?: boolean,
    boardComponent?: PluginComponent,
) {
    let teamInviteLink = null;
    const totalUsers = stats.total_users_count;
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    let setHeaderButton = null;
    let boardCreateButton = null;
    if (!isReadOnly) {
        boardCreateButton = createBoardsButton(channel, boardComponent);
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
                            createBoard={boardCreateButton}
                        />
                    }
                    {teamIsGroupConstrained &&
                    <ToggleModalButtonRedux
                        className='intro-links color--link'
                        modalId={ModalIdentifiers.ADD_GROUPS_TO_TEAM}
                        dialogType={AddGroupsToTeamModal}
                        dialogProps={{channel}}
                    >
                        <LocalizedIcon
                            className='fa fa-user-plus'
                            title={{id: t('generic_icons.add'), defaultMessage: 'Add Icon'}}
                        />
                        <FormattedMessage
                            id='intro_messages.addGroupsToTeam'
                            defaultMessage='Add other groups to this team'
                        />
                    </ToggleModalButtonRedux>
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
            {teamIsGroupConstrained && boardCreateButton}
            {teamIsGroupConstrained && setHeaderButton}
            <br/>
        </div>
    );
}

function createStandardIntroMessage(channel: Channel, centeredIntro: string, stats: any, usersLimit: number, currentUser: UserProfileRedux, locale: string, creatorName: string, boardComponent?: PluginComponent) {
    const uiName = channel.display_name;
    let memberMessage;
    const channelIsArchived = channel.delete_at !== 0;
    const totalUsers = stats.total_users_count;

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

    const boardCreateButton = createBoardsButton(channel, boardComponent);

    const channelInviteButton = (
        <AddMembersButton
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            setHeader={setHeaderButton}
            createBoard={boardCreateButton}
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
            {createNotificationButton(channel, currentUser )}
        </div>
    );
}

function createSetHeaderButton(channel: Channel) {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }

    const headerId = (channel.header) ? 'intro_messages.editHeader' : 'intro_messages.setHeader';
    const defaultMessage = (channel.header) ? 'Edit header' : 'Set header';
    const ariaLabel = (channel.header) ? Utils.localizeMessage('intro_messages.editHeader', defaultMessage) : Utils.localizeMessage('intro_messages.setHeader', defaultMessage);

    return (
        <ToggleModalButtonRedux
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            ariaLabel={ariaLabel}
            className={'intro-links channelIntroButton'}
            dialogType={EditChannelHeaderModal}
            dialogProps={channel}
        >
            <EditIcon/>
            <FormattedMessage
                id={headerId}
                defaultMessage={defaultMessage}
            />
        </ToggleModalButtonRedux>
    );
}

function createBoardsButton(channel: Channel, boardComponent?: PluginComponent) {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived || boardComponent === undefined) {
        return null;
    }

    return (
        <button
            className={'intro-links color--link channelIntroButton style--none'}
            onClick={() => {
                if (boardComponent.action) {
                    boardComponent.action();
                }
            }}
            aria-label={Utils.localizeMessage('intro_messages.createBoard', 'Create a board')}
        >
            {boardComponent.icon}
            <FormattedMessage
                id='intro_messages.createBoard'
                defaultMessage='Create a board'
            />
        </button>
    );
}

function createFavoriteButton(isFavorite: boolean, toggleFavorite: () => void) {
    return (
        <button
            id='toggleFavoriteIntroButton'
            className={'intro-links color--link channelIntroButton style--none'}
            onClick={toggleFavorite}
            aria-label={'Favorite'}
        >
            <i className={'icon ' + (isFavorite ? 'icon-star' : 'icon-star-outline')}/>
            <FormattedMessage
                id='intro_messages.favorite'
                defaultMessage='Favorite'
            />
        </button>
    );
}

function createNotificationButton(channel: Channel, user: UserProfileRedux) {
    return(
        <ToggleModalButtonRedux
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            ariaLabel={Utils.localizeMessage('intro_messages.notifications', 'Notifications')}
            className={'intro-links color--link channelIntroButton'}
            dialogType={ChannelNotificationsModal}
            dialogProps={{channel, currentUser: user}}
        >
            <i className='icon icon-bell-outline'/>
            <FormattedMessage
                id='intro_messages.notifications'
                defaultMessage='Notifications'
            />
        </ToggleModalButtonRedux>
    );
}
