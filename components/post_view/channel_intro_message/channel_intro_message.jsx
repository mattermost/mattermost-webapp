// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {Permissions} from 'mattermost-redux/constants';

import * as GlobalActions from 'actions/global_actions.jsx';
import Constants from 'utils/constants.jsx';
import ChannelInviteModal from 'components/channel_invite_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ProfilePicture from 'components/profile_picture.jsx';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import UserProfile from 'components/user_profile';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import EditIcon from 'components/icon/edit_icon';

import {getMonthLong} from 'utils/i18n.jsx';
import * as Utils from 'utils/utils.jsx';

export default class ChannelIntroMessage extends React.PureComponent {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        fullWidth: PropTypes.bool.isRequired,
        locale: PropTypes.string.isRequired,
        channelProfiles: PropTypes.array.isRequired,
        enableUserCreation: PropTypes.bool,
        isReadOnly: PropTypes.bool,
    };

    render() {
        const {
            channel,
            fullWidth,
            locale,
            enableUserCreation,
            isReadOnly,
            channelProfiles,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return createDMIntroMessage(channel, centeredIntro);
        } else if (channel.type === Constants.GM_CHANNEL) {
            return createGMIntroMessage(channel, centeredIntro, channelProfiles);
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return createDefaultIntroMessage(channel, centeredIntro, enableUserCreation, isReadOnly);
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return createOffTopicIntroMessage(channel, centeredIntro);
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return createStandardIntroMessage(channel, centeredIntro, locale);
        }
        return null;
    }
}

function createGMIntroMessage(channel, centeredIntro, profiles) {
    const channelIntroId = 'channelIntro';

    if (profiles.length > 0) {
        const pictures = [];
        let names = '';
        for (let i = 0; i < profiles.length; i++) {
            const profile = profiles[i];

            pictures.push(
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile)}
                    width='50'
                    height='50'
                    userId={profile.id}
                    username={profile.username}
                />
            );

            if (i === profiles.length - 1) {
                names += Utils.getDisplayNameByUser(profile);
            } else if (i === profiles.length - 2) {
                names += Utils.getDisplayNameByUser(profile) + ' and ';
            } else {
                names += Utils.getDisplayNameByUser(profile) + ', ';
            }
        }

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
                            names,
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
                        width='50'
                        height='50'
                        userId={teammate.id}
                        username={teammate.username}
                        hasMention={true}
                    />
                </div>
                <div className='channel-intro-profile'>
                    <strong>
                        <UserProfile
                            userId={teammate.id}
                            disablePopover={false}
                            hasMention={true}
                        />
                    </strong>
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
    var uiType = (
        <FormattedMessage
            id='intro_messages.channel'
            defaultMessage='channel'
        />
    );

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

    const channelInviteButton = createInviteChannelMemberButton(channel, uiType);

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

export function createDefaultIntroMessage(channel, centeredIntro, enableUserCreation, isReadOnly) {
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
                    <span
                        className='intro-links color--link cursor--pointer'
                        onClick={GlobalActions.showGetTeamInviteLinkModal}
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
                            id='intro_messages.inviteOthers'
                            defaultMessage='Invite others to this team'
                        />
                    </span>
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
    var uiType;
    var memberMessage;
    const channelIsArchived = channel.delete_at !== 0;

    if (channelIsArchived) {
        memberMessage = '';
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        uiType = (
            <FormattedMessage
                id='intro_messages.group'
                defaultMessage='private channel'
            />
        );
        memberMessage = (
            <FormattedMessage
                id='intro_messages.onlyInvited'
                defaultMessage=' Only invited members can see this private channel.'
            />
        );
    } else {
        uiType = (
            <FormattedMessage
                id='intro_messages.channel'
                defaultMessage='channel'
            />
        );
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
        createMessage = (
            <FormattedMessage
                id='intro_messages.noCreator'
                defaultMessage='This is the start of the {name} {type}, created on {date}.'
                values={{
                    name: (uiName),
                    type: (uiType),
                    date,
                }}
            />
        );
    } else {
        createMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.creator'
                    defaultMessage='This is the start of the {name} {type}, created by {creator} on {date}.'
                    values={{
                        name: (uiName),
                        type: (uiType),
                        creator: (creatorName),
                        date,
                    }}
                />
            </span>
        );
    }

    var purposeMessage = '';
    if (channel.purpose && channel.purpose !== '') {
        purposeMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.purpose'
                    defaultMessage=" This {type}'s purpose is: {purpose}"
                    values={{
                        purpose: channel.purpose,
                        type: (uiType),
                    }}
                />
            </span>
        );
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

    const channelInviteButton = createInviteChannelMemberButton(channel, uiType);

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

function createInviteChannelMemberButton(channel, uiType) {
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
                dialogType={ChannelInviteModal}
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
                    id='intro_messages.invite'
                    defaultMessage='Invite others to this {type}'
                    values={{
                        type: (uiType),
                    }}
                />
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
        <ToggleModalButton
            className='intro-links color--link'
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <EditIcon/>
            <FormattedMessage
                id='intro_messages.setHeader'
                defaultMessage='Set a Header'
            />
        </ToggleModalButton>
    );
}
