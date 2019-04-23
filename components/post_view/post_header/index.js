// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {isGuest} from 'utils/utils.jsx';

import PostHeader from './post_header.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const user = getUser(state, ownProps.post.user_id);
    const isBot = Boolean(user && user.is_bot);

    return {
        enablePostUsernameOverride,
        isBot,
        isGuest: Boolean(user && isGuest(user)),
    };
}

export default connect(mapStateToProps)(PostHeader);
