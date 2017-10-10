// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PostTypes} from 'utils/constants.jsx';
import {formatText} from 'utils/text_formatting.jsx';

function renderUsername(value, options) {
    return renderFormattedText(value, {...options, markdown: false});
}

function renderFormattedText(value, options) {
    return <span dangerouslySetInnerHTML={{__html: formatText(value, options)}}/>;
}

function renderJoinChannelMessage(post, options) {
    const username = renderUsername(post.props.username, options);

    return null;
}

function renderLeaveChannelMessage(post, options) {
    const username = renderUsername(post.props.username, options);

    return null;
}

function renderAddToChannelMessage(post, options) {
    const username = renderUsername(post.props.username, options);
    const addedUsername = renderUsername(post.props.addedUsername, options);


    return null;
}

function renderRemoveFromChannelMessage(post, options) {
    const removedUsername = renderUsername(post.props.removedUsername, options);

    return null;
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
            return null;
        }

        
        return null;
    } else if (post.props.old_header) {
        return null;
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

    return null;
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
            return null;
        }
        return null;
    } else if (post.props.old_purpose) {
        return null;
    }

    return null;
}

function renderChannelDeletedMessage(post, options) {
    if (!post.props.username) {
        return null;
    }

    const username = renderUsername(post.props.username, options);
    return null;
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
