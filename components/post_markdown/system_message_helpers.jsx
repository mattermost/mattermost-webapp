// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {General, Posts} from 'mattermost-redux/constants';

import * as Utils from 'utils/utils.jsx';

import Markdown from 'components/markdown';
import CombinedSystemMessage from 'components/post_view/combined_system_message';
import PostAddChannelMember from 'components/post_view/post_add_channel_member';

function renderUsername(value) {
    const username = (value[0] === '@') ? value : `@${value}`;

    const options = {
        markdown: false,
    };

    return renderFormattedText(username, options);
}

function renderFormattedText(value, options, post) {
    return (
        <Markdown
            message={value}
            options={options}
            postId={post && post.id}
            postType={post && post.type}
        />
    );
}

function renderJoinChannelMessage(post) {
    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.channel.join_channel.post_and_forget'
            defaultMessage='{username} joined the channel.'
            values={{username}}
        />
    );
}

function renderGuestJoinChannelMessage(post) {
    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.channel.guest_join_channel.post_and_forget'
            defaultMessage='{username} joined the channel as a guest.'
            values={{username}}
        />
    );
}

function renderLeaveChannelMessage(post) {
    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.channel.leave.left'
            defaultMessage='{username} has left the channel.'
            values={{username}}
        />
    );
}

function renderAddToChannelMessage(post) {
    const username = renderUsername(post.props.username);
    const addedUsername = renderUsername(post.props.addedUsername);

    return (
        <FormattedMessage
            id='api.channel.add_member.added'
            defaultMessage='{addedUsername} added to the channel by {username}.'
            values={{
                username,
                addedUsername,
            }}
        />
    );
}

function renderAddGuestToChannelMessage(post) {
    const username = renderUsername(post.props.username);
    const addedUsername = renderUsername(post.props.addedUsername);

    return (
        <FormattedMessage
            id='api.channel.add_guest.added'
            defaultMessage='{addedUsername} added to the channel as a guest by {username}.'
            values={{
                username,
                addedUsername,
            }}
        />
    );
}

function renderRemoveFromChannelMessage(post) {
    const removedUsername = renderUsername(post.props.removedUsername);

    return (
        <FormattedMessage
            id='api.channel.remove_member.removed'
            defaultMessage='{removedUsername} was removed from the channel'
            values={{
                removedUsername,
            }}
        />
    );
}

function renderJoinTeamMessage(post) {
    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.team.join_team.post_and_forget'
            defaultMessage='{username} joined the team.'
            values={{username}}
        />
    );
}

function renderLeaveTeamMessage(post) {
    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.team.leave.left'
            defaultMessage='{username} left the team.'
            values={{username}}
        />
    );
}

function renderAddToTeamMessage(post) {
    const username = renderUsername(post.props.username);
    const addedUsername = renderUsername(post.props.addedUsername);

    return (
        <FormattedMessage
            id='api.team.add_member.added'
            defaultMessage='{addedUsername} added to the team by {username}.'
            values={{
                username,
                addedUsername,
            }}
        />
    );
}

function renderRemoveFromTeamMessage(post) {
    const removedUsername = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.team.remove_user_from_team.removed'
            defaultMessage='{removedUsername} was removed from the team.'
            values={{
                removedUsername,
            }}
        />
    );
}

function renderHeaderChangeMessage(post) {
    if (!post.props.username) {
        return null;
    }

    const headerOptions = {
        singleline: true,
        channelNamesMap: post.props && post.props.channel_mentions,
        mentionHighlight: true,
    };

    const username = renderUsername(post.props.username);
    const oldHeader = post.props.old_header ? renderFormattedText(post.props.old_header, headerOptions, post) : null;
    const newHeader = post.props.new_header ? renderFormattedText(post.props.new_header, headerOptions, post) : null;

    if (post.props.new_header) {
        if (post.props.old_header) {
            return (
                <FormattedMessage
                    id='api.channel.post_update_channel_header_message_and_forget.updated_from'
                    defaultMessage='{username} updated the channel header from: {old} to: {new}'
                    values={{
                        username,
                        old: oldHeader,
                        new: newHeader,
                    }}
                />
            );
        }

        return (
            <FormattedMessage
                id='api.channel.post_update_channel_header_message_and_forget.updated_to'
                defaultMessage='{username} updated the channel header to: {new}'
                values={{
                    username,
                    new: newHeader,
                }}
            />
        );
    } else if (post.props.old_header) {
        return (
            <FormattedMessage
                id='api.channel.post_update_channel_header_message_and_forget.removed'
                defaultMessage='{username} removed the channel header (was: {old})'
                values={{
                    username,
                    old: oldHeader,
                }}
            />
        );
    }

    return null;
}

function renderDisplayNameChangeMessage(post) {
    if (!(post.props.username && post.props.old_displayname && post.props.new_displayname)) {
        return null;
    }

    const username = renderUsername(post.props.username);
    const oldDisplayName = post.props.old_displayname;
    const newDisplayName = post.props.new_displayname;

    return (
        <FormattedMessage
            id='api.channel.post_update_channel_displayname_message_and_forget.updated_from'
            defaultMessage='{username} updated the channel display name from: {old} to: {new}'
            values={{
                username,
                old: oldDisplayName,
                new: newDisplayName,
            }}
        />
    );
}

function renderConvertChannelToPrivateMessage(post) {
    if (!(post.props.username)) {
        return null;
    }

    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.channel.post_convert_channel_to_private.updated_from'
            defaultMessage='{username} converted the channel from public to private'
            values={{
                username,
            }}
        />
    );
}

function renderPurposeChangeMessage(post) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsername(post.props.username);
    const oldPurpose = post.props.old_purpose;
    const newPurpose = post.props.new_purpose;

    if (post.props.new_purpose) {
        if (post.props.old_purpose) {
            return (
                <FormattedMessage
                    id='app.channel.post_update_channel_purpose_message.updated_from'
                    defaultMessage='{username} updated the channel purpose from: {old} to: {new}'
                    values={{
                        username,
                        old: oldPurpose,
                        new: newPurpose,
                    }}
                />
            );
        }

        return (
            <FormattedMessage
                id='app.channel.post_update_channel_purpose_message.updated_to'
                defaultMessage='{username} updated the channel purpose to: {new}'
                values={{
                    username,
                    new: newPurpose,
                }}
            />
        );
    } else if (post.props.old_purpose) {
        return (
            <FormattedMessage
                id='app.channel.post_update_channel_purpose_message.removed'
                defaultMessage='{username} removed the channel purpose (was: {old})'
                values={{
                    username,
                    old: oldPurpose,
                }}
            />
        );
    }

    return null;
}

function renderChannelDeletedMessage(post) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.channel.delete_channel.archived'
            defaultMessage='{username} has archived the channel.'
            values={{username}}
        />
    );
}

function renderChannelUnarchivedMessage(post) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsername(post.props.username);

    return (
        <FormattedMessage
            id='api.channel.restore_channel.unarchived'
            defaultMessage='{username} has unarchived the channel.'
            values={{username}}
        />
    );
}

function renderMeMessage(post) {
    return renderFormattedText((post.props && post.props.message) ? post.props.message : post.message);
}

const systemMessageRenderers = {
    [Posts.POST_TYPES.JOIN_CHANNEL]: renderJoinChannelMessage,
    [Posts.POST_TYPES.GUEST_JOIN_CHANNEL]: renderGuestJoinChannelMessage,
    [Posts.POST_TYPES.LEAVE_CHANNEL]: renderLeaveChannelMessage,
    [Posts.POST_TYPES.ADD_TO_CHANNEL]: renderAddToChannelMessage,
    [Posts.POST_TYPES.ADD_GUEST_TO_CHANNEL]: renderAddGuestToChannelMessage,
    [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: renderRemoveFromChannelMessage,
    [Posts.POST_TYPES.JOIN_TEAM]: renderJoinTeamMessage,
    [Posts.POST_TYPES.LEAVE_TEAM]: renderLeaveTeamMessage,
    [Posts.POST_TYPES.ADD_TO_TEAM]: renderAddToTeamMessage,
    [Posts.POST_TYPES.REMOVE_FROM_TEAM]: renderRemoveFromTeamMessage,
    [Posts.POST_TYPES.HEADER_CHANGE]: renderHeaderChangeMessage,
    [Posts.POST_TYPES.DISPLAYNAME_CHANGE]: renderDisplayNameChangeMessage,
    [Posts.POST_TYPES.CONVERT_CHANNEL]: renderConvertChannelToPrivateMessage,
    [Posts.POST_TYPES.PURPOSE_CHANGE]: renderPurposeChangeMessage,
    [Posts.POST_TYPES.CHANNEL_DELETED]: renderChannelDeletedMessage,
    [Posts.POST_TYPES.CHANNEL_UNARCHIVED]: renderChannelUnarchivedMessage,
    [Posts.POST_TYPES.ME]: renderMeMessage,
};

export function renderSystemMessage(post, channel, isUserCanManageMembers) {
    if (post.props && post.props.add_channel_member) {
        const isEphemeral = Utils.isPostEphemeral(post);

        if ((channel.type === General.PRIVATE_CHANNEL || channel.type === General.OPEN_CHANNEL) &&
            isUserCanManageMembers &&
            isEphemeral
        ) {
            const addMemberProps = post.props.add_channel_member;
            return (
                <PostAddChannelMember
                    postId={addMemberProps.post_id}
                    userIds={addMemberProps.not_in_channel_user_ids}
                    noGroupsUsernames={addMemberProps.not_in_groups_usernames}
                    usernames={addMemberProps.not_in_channel_usernames}
                />
            );
        }

        return null;
    } else if (systemMessageRenderers[post.type]) {
        return systemMessageRenderers[post.type](post);
    } else if (post.type === Posts.POST_TYPES.EPHEMERAL_ADD_TO_CHANNEL) {
        return renderAddToChannelMessage(post);
    } else if (post.type === Posts.POST_TYPES.COMBINED_USER_ACTIVITY) {
        const {allUserIds, allUsernames, messageData} = post.props.user_activity;

        return (
            <CombinedSystemMessage
                allUserIds={allUserIds}
                allUsernames={allUsernames}
                messageData={messageData}
            />
        );
    }

    return null;
}
