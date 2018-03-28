// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {isChannelReadOnlyById} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import RhsComment from './rhs_comment.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        enableEmojiPicker,
        enablePostUsernameOverride,
        isReadOnly: isChannelReadOnlyById(state, ownProps.post.channel_id),
    };
}

export default connect(mapStateToProps)(RhsComment);
