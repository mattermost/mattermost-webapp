// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import RhsRootPost from './rhs_root_post.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        enableEmojiPicker,
        enablePostUsernameOverride,
    };
}

export default connect(mapStateToProps)(RhsRootPost);
