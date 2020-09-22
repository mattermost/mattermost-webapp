// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {Client4} from 'mattermost-redux/client';

import {isGuest} from 'utils/utils.jsx';

import PostHeader from './post_header.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';

    const overrideIconUrl = enablePostIconOverride && ownProps.post && ownProps.post.props && ownProps.post.props.override_icon_url;
    let overwriteIcon;
    if (overrideIconUrl) {
        overwriteIcon = Client4.getAbsoluteUrl(overrideIconUrl);
    }

    const user = getUser(state, ownProps.post.user_id);
    const isBot = Boolean(user && user.is_bot);

    return {
        enablePostUsernameOverride,
        isBot,
        overwriteIcon,
        isGuest: Boolean(user && isGuest(user)),
    };
}

export default connect(mapStateToProps)(PostHeader);
