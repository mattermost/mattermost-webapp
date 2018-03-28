// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import ChannelStore from 'stores/channel_store.jsx';

import {canManageMembers} from 'utils/channel_utils.jsx';
import {Constants, PostTypes} from 'utils/constants.jsx';
import {formatText} from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import PostAddChannelMember from 'components/post_view/post_add_channel_member';

function renderUsername(value, options) {
    return renderFormattedText(value, {...options, markdown: false});
}

function renderUsernameForUserIdAndUsername(userId, username, options) {
    const displayUsername = Utils.getDisplayNameByUserId(userId, options);
    if (displayUsername && displayUsername.trim() !== '') {
        return renderUsername(displayUsername);
    }
    return renderUsername(username);
}

function renderFormattedText(value, options) {
    return <span dangerouslySetInnerHTML={{__html: formatText(value, options)}}/>;
}

function renderJoinChannelMessage(post, options) {
    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);

    return (
        <FormattedMessage
            id='api.channel.join_channel.post_and_forget'
            defaultMessage='{username} joined the channel.'
            values={{username}}
        />
    );
}

function renderLeaveChannelMessage(post, options) {
    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);

    return (
        <FormattedMessage
            id='api.channel.leave.left'
            defaultMessage='{username} has left the channel.'
            values={{username}}
        />
    );
}

function renderAddToChannelMessage(post, options) {
    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);
    const addedUsername = renderUsernameForUserIdAndUsername(post.props.addedUserId, post.props.addedUsername, options);

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

function renderRemoveFromChannelMessage(post, options) {
    const removedUsername = renderUsernameForUserIdAndUsername(post.props.removedUserId, post.props.removedUsername, options);

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

function renderJoinTeamMessage(post, options) {
    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);

    return (
        <FormattedMessage
            id='api.team.join_team.post_and_forget'
            defaultMessage='{username} joined the team.'
            values={{username}}
        />
    );
}

function renderLeaveTeamMessage(post, options) {
    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);

    return (
        <FormattedMessage
            id='api.team.leave.left'
            defaultMessage='{username} left the team.'
            values={{username}}
        />
    );
}

function renderAddToTeamMessage(post, options) {
    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);
    const addedUsername = renderUsernameForUserIdAndUsername(post.props.addedUserId, post.props.addedUsername, options);

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

function renderRemoveFromTeamMessage(post, options) {
    const removedUsername = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);

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

function renderHeaderChangeMessage(post, options) {
    if (!post.props.username) {
        return null;
    }

    const headerOptions = {
        ...options,
        singleline: true,
    };

    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);
    const oldHeader = post.props.old_header ? renderFormattedText(post.props.old_header, headerOptions) : null;
    const newHeader = post.props.new_header ? renderFormattedText(post.props.new_header, headerOptions) : null;

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

function renderDisplayNameChangeMessage(post, options) {
    if (!(post.props.username && post.props.old_displayname && post.props.new_displayname)) {
        return null;
    }

    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);
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

function renderPurposeChangeMessage(post, options) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);
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

function renderChannelDeletedMessage(post, options) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsernameForUserIdAndUsername(post.user_id, post.props.username, options);

    return (
        <FormattedMessage
            id='api.channel.delete_channel.archived'
            defaultMessage='{username} has archived the channel.'
            values={{username}}
        />
    );
}

const systemMessageRenderers = {
    [PostTypes.JOIN_CHANNEL]: renderJoinChannelMessage,
    [PostTypes.LEAVE_CHANNEL]: renderLeaveChannelMessage,
    [PostTypes.ADD_TO_CHANNEL]: renderAddToChannelMessage,
    [PostTypes.REMOVE_FROM_CHANNEL]: renderRemoveFromChannelMessage,
    [PostTypes.JOIN_TEAM]: renderJoinTeamMessage,
    [PostTypes.LEAVE_TEAM]: renderLeaveTeamMessage,
    [PostTypes.ADD_TO_TEAM]: renderAddToTeamMessage,
    [PostTypes.REMOVE_FROM_TEAM]: renderRemoveFromTeamMessage,
    [PostTypes.HEADER_CHANGE]: renderHeaderChangeMessage,
    [PostTypes.DISPLAYNAME_CHANGE]: renderDisplayNameChangeMessage,
    [PostTypes.PURPOSE_CHANGE]: renderPurposeChangeMessage,
    [PostTypes.CHANNEL_DELETED]: renderChannelDeletedMessage,
};

export function renderSystemMessage(post, options) {
    if (post.props && post.props.add_channel_member) {
        const channel = ChannelStore.getCurrent();
        const isUserCanManageMembers = canManageMembers(channel);
        const isEphemeral = Utils.isPostEphemeral(post);

        if ((channel.type === Constants.PRIVATE_CHANNEL || channel.type === Constants.OPEN_CHANNEL) &&
            isUserCanManageMembers &&
            isEphemeral
        ) {
            const addMemberProps = post.props.add_channel_member;
            return (
                <PostAddChannelMember
                    postId={addMemberProps.post_id}
                    userIds={addMemberProps.user_ids}
                    usernames={addMemberProps.usernames}
                />
            );
        }

        return null;
    } else if (systemMessageRenderers[post.type]) {
        return systemMessageRenderers[post.type](post, options);
    } else if (post.type === PostTypes.EPHEMERAL_ADD_TO_CHANNEL) {
        return renderAddToChannelMessage(post, options);
    }

    return null;
}
