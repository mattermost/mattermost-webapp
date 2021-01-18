// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';

import {Client4} from 'mattermost-redux/client';

import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import {isGuest} from 'utils/utils.jsx';

import {getCustomStatus} from 'selectors/views/custom_status';
import {openModal} from 'actions/views/modals';

import PostHeader, {Props} from './post_header';

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';

    const overrideIconUrl = enablePostIconOverride && ownProps.post?.props?.override_icon_url;
    let overwriteIcon;
    if (overrideIconUrl) {
        overwriteIcon = Client4.getAbsoluteUrl(overrideIconUrl);
    }

    const user = getUser(state, ownProps.post.user_id);
    const currentUser = getCurrentUser(state);
    const customStatus = user ? getCustomStatus(state, user.id) : {};
    const isBot = Boolean(user && user.is_bot);

    return {
        enablePostUsernameOverride,
        isBot,
        overwriteIcon,
        isGuest: Boolean(user && isGuest(user)),
        customStatus,
        currentUserID: currentUser.id,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostHeader);
