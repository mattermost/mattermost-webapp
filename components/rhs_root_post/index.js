// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {isChannelReadOnlyById, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {makeGetReactionsForPost} from 'mattermost-redux/selectors/entities/posts';
import {makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {markPostAsUnread, emitShortcutReactToLastPostFrom} from 'actions/post_actions.jsx';
import {isEmbedVisible} from 'selectors/posts';
import {getEmojiMap} from 'selectors/emojis';
import {isArchivedChannel} from 'utils/channel_utils';
import {Preferences} from 'utils/constants';

import {getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis.js';

import RhsRootPost from './rhs_root_post.jsx';

function mapStateToProps(state, ownProps) {
    const getReactionsForPost = makeGetReactionsForPost();
    const getDisplayName = makeGetDisplayName();

    const config = getConfig(state);
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const teamId = ownProps.teamId || getCurrentTeamId(state);
    const channel = getChannel(state, ownProps.post.channel_id);
    const emojiMap = getEmojiMap(state);
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);

    return {
        author: getDisplayName(state, ownProps.post.user_id),
        reactions: getReactionsForPost(state, ownProps.post.id),
        emojiMap,
        enableEmojiPicker,
        enablePostUsernameOverride,
        isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
        isReadOnly: isChannelReadOnlyById(state, ownProps.post.channel_id),
        teamId,
        pluginPostTypes: state.plugins.postTypes,
        channelIsArchived: isArchivedChannel(channel),
        isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, ownProps.post.id, null) != null,
        compactDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
        shortcutReactToLastPostEmittedFrom,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            markPostAsUnread,
            emitShortcutReactToLastPostFrom,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(RhsRootPost);
