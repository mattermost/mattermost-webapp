// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {Permissions} from 'mattermost-redux/constants';

import {Constants, ModalIdentifiers} from 'utils/constants';
import ChannelInviteModal from 'components/channel_invite_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ProfilePicture from 'components/profile_picture.jsx';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import UserProfile from 'components/user_profile';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import EditIcon from 'components/widgets/icons/fa_edit_icon';
import InvitationModal from 'components/invitation_modal';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {getMonthLong} from 'utils/i18n.jsx';
import * as Utils from 'utils/utils.jsx';

export default class ChannelIntroMessage extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        channel: PropTypes.object.isRequired,
        fullWidth: PropTypes.bool.isRequired,
        locale: PropTypes.string.isRequired,
        channelProfiles: PropTypes.array.isRequired,
        enableUserCreation: PropTypes.bool,
        isReadOnly: PropTypes.bool,
        teamIsGroupConstrained: PropTypes.bool,
    };

    render() {
        const {
            currentUserId,
            channel,
            fullWidth,
            locale,
            enableUserCreation,
            isReadOnly,
            channelProfiles,
            teamIsGroupConstrained,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return createDMIntroMessage(channel, centeredIntro);
        } else if (channel.type === Constants.GM_CHANNEL) {
            return createGMIntroMessage(channel, centeredIntro, channelProfiles, currentUserId);
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return createDefaultIntroMessage(channel, centeredIntro, enableUserCreation, isReadOnly, teamIsGroupConstrained);
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return createOffTopicIntroMessage(channel, centeredIntro);
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return createStandardIntroMessage(channel, centeredIntro, locale);
        }
        return null;
    }
}

function createGMIntroMessage(channel, centeredIntro, profiles, currentUserId) {
    const channelIntroId = 'channelIntro';

    if (profiles.length > 0) {
        const pictures = profiles.
            filter((profile) => profile.id !== currentUserId).
            map((profile) => (
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile)}
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

function createDMIntroMessage(channel, centeredIntro) {
    var teammate = Utils.getDirectTeammate(channel.id);
    const channelIntroId = 'channelIntro';

    if (teammate) {
        var teammateName = teammate.username;
        if (teammate.nickname.length > 0) {
            teammateName = teammate.nickname;
        }

        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    <ProfilePicture
                        src={Utils.imageURLForUser(teammate)}
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

function createOffTopicIntroMessage(channel, centeredIntro) {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const children = createSetHeaderButton(channel);
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

    const channelInviteButton = createInviteChannelButton(channel);

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h4 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h4>
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
            {setHeaderButton}
        </div>
    );
}

export function createDefaultIntroMessage(channel, centeredIntro, enableUserCreation, isReadOnly, teamIsGroupConstrained) {
    let teamInviteLink = null;

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
                    <FormattedMessage
                        id='intro_messages.inviteOthers'
                        defaultMessage='Invite others to this team'
                    >
                        {(message) => (
                            <ToggleModalButtonRedux
                                accessibilityLabel={message}
                                id='introTextInvite'
                                className='intro-links color--link cursor--pointer'
                                modalId={ModalIdentifiers.INVITATION}
                                dialogType={InvitationModal}
                            >
                                <FormattedMessage
                                    id='generic_icons.add'
                                    defaultMessage='Add Icon'
                                >
                                    {(title) => (
                                        <i
                                            className='fa fa-user-plus'
                                            title={title}
                                        />
                                    )}
                                </FormattedMessage>
                                {message}
                            </ToggleModalButtonRedux>
                        )}
                    </FormattedMessage>
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
                            {(title) => (
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

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h4 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h4>
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
            {setHeaderButton}
            <br/>
        </div>
    );
}

function createStandardIntroMessage(channel, centeredIntro, locale) {
    var uiName = channel.display_name;
    var creatorName = Utils.getDisplayNameByUserId(channel.creator_id);
    var memberMessage;
    const channelIsArchived = channel.delete_at !== 0;

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

    var createMessage;
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

    var purposeMessage = '';
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

    const channelInviteButton = createInviteChannelButton(channel);

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h4 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: (uiName),
                    }}
                />
            </h4>
            <p className='channel-intro__content'>
                {createMessage}
                {memberMessage}
                {purposeMessage}
                <br/>
            </p>
            {channelInviteButton}
            {setHeaderButton}
        </div>
    );
}

function createInviteChannelButton(channel) {
    const modal = channel.group_constrained ? AddGroupsToChannelModal : ChannelInviteModal;
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    return (
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
                    {(title) => (
                        <i
                            className='fa fa-user-plus'
                            title={title}
                        />
                    )}
                </FormattedMessage>
                {isPrivate && channel.group_constrained &&
                    <FormattedMessage
                        id='intro_messages.addGroups'
                        defaultMessage='Add groups to this private channel'
                    />}
                {isPrivate && !channel.group_constrained &&
                    <FormattedMessage
                        id='intro_messages.invitePrivate'
                        defaultMessage='Invite others to this private channel'
                    />}
                {!isPrivate &&
                    <FormattedMessage
                        id='intro_messages.invite'
                        defaultMessage='Invite others to this channel'
                    />}
            </ToggleModalButton>
        </ChannelPermissionGate>
    );
}

function createSetHeaderButton(channel) {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }

    return (
        <FormattedMessage
            id='intro_messages.setHeader'
            defaultMessage='Set a Header'
        >
            {(message) => (
                <ToggleModalButtonRedux
                    modalId='editChannelHeaderModal'
                    accessibilityLabel={message}
                    className={'intro-links color--link'}
                    dialogType={EditChannelHeaderModal}
                    dialogProps={{channel}}
                >
                    <EditIcon/>
                    {message}
                </ToggleModalButtonRedux>
            )}
        </FormattedMessage>
    );
}
