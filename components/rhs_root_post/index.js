// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import RhsRootPost from './rhs_root_post.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        ...ownProps,
        enableEmojiPicker,
        enablePostUsernameOverride
    };
}

export default connect(mapStateToProps)(RhsRootPost);
