// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {removePost} from 'mattermost-redux/actions/posts';
import {isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {Preferences} from 'utils/constants.jsx';

import PostInfo from './post_info.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const channel = state.entities.channels.channels[ownProps.post.channel_id];
    const channelIsArchived = channel ? channel.delete_at !== 0 : null;
    const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !channelIsArchived;
    const teamId = getCurrentTeamId(state);

    return {
        teamId,
        isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, ownProps.post.id, null) != null,
        isMobile: state.views.channel.mobileView,
        enableEmojiPicker,
        isReadOnly: isCurrentChannelReadOnly(state) || channelIsArchived,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            removePost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostInfo);
