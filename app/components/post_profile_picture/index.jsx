// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import PostProfilePicture from './post_profile_picture';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const user = getUser(state, ownProps.userId);
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';

    const overrideIconUrl = enablePostIconOverride && ownProps.post && ownProps.post.props && ownProps.post.props.override_icon_url;
    let overwriteIcon;
    if (overrideIconUrl) {
        overwriteIcon = Client4.getAbsoluteUrl(overrideIconUrl);
    }

    return {
        enablePostIconOverride: config.EnablePostIconOverride === 'true',
        overwriteIcon,
        hasImageProxy: config.HasImageProxy === 'true',
        status: getStatusForUserId(state, ownProps.userId),
        isBot: Boolean(user && user.is_bot),
        user,
    };
}

export default connect(mapStateToProps)(PostProfilePicture);
