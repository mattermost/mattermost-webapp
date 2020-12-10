// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {openModal} from 'actions/views/modals';
import {
    flagPost,
    unflagPost,
    pinPost,
    unpinPost,
    setEditingPost,
    markPostAsUnread,
} from 'actions/post_actions.jsx';
import * as PostUtils from 'utils/post_utils.jsx';

import {isArchivedChannel} from 'utils/channel_utils';
import {getSiteURL} from 'utils/url';

import DotMenu from './dot_menu.js';
import {GlobalState} from 'types/store/index.js';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/src/types/posts';

type OwnProps = {
    post: Pick<Post, 'id' | 'channel_id' | 'create_at' | 'is_pinned' | 'root_id'>;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const {post} = ownProps;

    const license = getLicense(state);
    const config = getConfig(state);
    const userId = getCurrentUserId(state);
    const channel = getChannel(state, ownProps.post.channel_id);
    const currentTeam = getCurrentTeam(state) || {};
    const currentTeamUrl = `${getSiteURL()}/${currentTeam.name}`;

    return {
        channelIsArchived: isArchivedChannel(channel),
        components: state.plugins.components,
        postEditTimeLimit: getConfig(state).PostEditTimeLimit || '',
        isLicensed: getLicense(state).IsLicensed === 'true',
        teamId: getCurrentTeamId(state),
        pluginMenuItems: state.plugins.components.PostDropdownMenu,
        shouldShowDotMenu: PostUtils.shouldShowDotMenu(state, post, channel),
        canEdit: PostUtils.canEditPost(state, post, license, config, channel, userId),
        canDelete: PostUtils.canDeletePost(state, post, channel),
        currentTeamUrl,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            flagPost,
            unflagPost,
            setEditingPost,
            pinPost,
            unpinPost,
            openModal,
            markPostAsUnread,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DotMenu);
