// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PostTypes} from 'utils/constants.jsx';
import {formatText} from 'utils/text_formatting.jsx';

const userActivityGetters = {
    [PostTypes.JOIN_CHANNEL]: getJoinChannelMessage,
    [PostTypes.LEAVE_CHANNEL]: getLeaveChannelMessage,
    [PostTypes.ADD_TO_CHANNEL]: getAddToChannelMessage,
    [PostTypes.REMOVE_FROM_CHANNEL]: getRemoveFromChannelMessage
};

function getJoinChannelMessage(messageProps, options) {
    const username = renderUsername(messageProps.username, options);

    return (
        <FormattedMessage
            id='api.channel.join_channel.post_and_forget'
            defaultMessage='{username} joined the channel.'
            values={{username}}
        />
    );
}

function getLeaveChannelMessage(messageProps, options) {
    const username = renderUsername(messageProps.username, options);

    return (
        <FormattedMessage
            id='api.channel.leave.left'
            defaultMessage='{username} left the channel.'
            values={{username}}
        />
    );
}

function getAddToChannelMessage(messageProps, options) {
    const username = renderUsername(messageProps.username, options);
    const addedUsername = renderUsername(messageProps.addedUsername, options);
    return (
        <FormattedMessage
            id='api.channel.add_member.added'
            defaultMessage='{username} added {addedUsername} to the channel.'
            values={{
                username,
                addedUsername
            }}
        />
    );
}

function getRemoveFromChannelMessage(messageProps, options) {
    const removedUsername = renderUsername(messageProps.removedUsername, options);

    return (
        <FormattedMessage
            id='api.channel.remove_member.removed'
            defaultMessage='{removedUsername} was removed from the channel.'
            values={{removedUsername}}
        />
    );
}

function renderUserActivity(post, options, getMessageFn) {
    if (post.props.user_activities) {
        const userActivities = post.props.user_activities.map((activity, key) => {
            return <span key={key}>{userActivityGetters[activity.type](activity, options)}</span>;
        });

        return <div>{userActivities}</div>;
    }

    return getMessageFn(post.props, options);
}

function renderJoinChannelMessage(post, options) {
    return renderUserActivity(post, options, getJoinChannelMessage);
}

function renderLeaveChannelMessage(post, options) {
    return renderUserActivity(post, options, getLeaveChannelMessage);
}

function renderAddToChannelMessage(post, options) {
    return renderUserActivity(post, options, getAddToChannelMessage);
}

function renderRemoveFromChannelMessage(post, options) {
    return renderUserActivity(post, options, getRemoveFromChannelMessage);
}

function renderUsername(value, options) {
    return renderFormattedText(value, {...options, markdown: false});
}

function renderFormattedText(value, options) {
    return <span dangerouslySetInnerHTML={{__html: formatText(value, options)}}/>;
}

function renderHeaderChangeMessage(post, options) {
    if (!post.props.username) {
        return null;
    }

    const headerOptions = {
        ...options,
        singleline: true
    };

    const username = renderUsername(post.props.username, options);
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
                        new: newHeader
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
                    new: newHeader
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
                    old: oldHeader
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

    const username = renderUsername(post.props.username, options);
    const oldDisplayName = post.props.old_displayname;
    const newDisplayName = post.props.new_displayname;

    return (
        <FormattedMessage
            id='api.channel.post_update_channel_displayname_message_and_forget.updated_from'
            defaultMessage='{username} updated the channel display name from: {old} to: {new}'
            values={{
                username,
                old: oldDisplayName,
                new: newDisplayName
            }}
        />
    );
}

function renderPurposeChangeMessage(post, options) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsername(post.props.username, options);
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
                        new: newPurpose
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
                    new: newPurpose
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
                    old: oldPurpose
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

    const username = renderUsername(post.props.username, options);

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
    [PostTypes.HEADER_CHANGE]: renderHeaderChangeMessage,
    [PostTypes.DISPLAYNAME_CHANGE]: renderDisplayNameChangeMessage,
    [PostTypes.PURPOSE_CHANGE]: renderPurposeChangeMessage,
    [PostTypes.CHANNEL_DELETED]: renderChannelDeletedMessage
};

export function renderSystemMessage(post, options) {
    if (!systemMessageRenderers[post.type]) {
        return null;
    }

    return systemMessageRenderers[post.type](post, options);
}
