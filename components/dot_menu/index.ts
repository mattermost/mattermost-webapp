// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';

import {openModal} from 'actions/views/modals';
import {doAppCall} from 'actions/apps';
import {
    flagPost,
    unflagPost,
    pinPost,
    unpinPost,
    setEditingPost,
    markPostAsUnread,
} from 'actions/post_actions.jsx';
import {GlobalState} from 'types/store';
import * as PostUtils from 'utils/post_utils.jsx';
import {isArchivedChannel} from 'utils/channel_utils';
import {getSiteURL} from 'utils/url';

import DotMenu, {Location} from './dot_menu';

type OwnProps = {
    post: Post;
    commentCount?: number;
    isFlagged?: boolean;
    handleCommentClick?: () => void;
    handleDropdownOpened?: () => void;
    handleAddReactionClick?: () => void;
    isMenuOpen?: boolean;
    isReadOnly?: boolean;
    enableEmojiPicker: boolean;
    location: Location,
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const {post} = ownProps;

    const license = getLicense(state);
    const config = getConfig(state);
    const userId = getCurrentUserId(state);
    const channel = getChannel(state, post.channel_id);
    const currentTeam = getCurrentTeam(state) || {};
    const currentTeamUrl = `${getSiteURL()}/${currentTeam.name}`;

    const appBindings = getAppBindings(state, AppBindingLocations.POST_MENU_ITEM);

    let postEditTimeLimit;
    if (config.PostEditTimeLimit) {
        postEditTimeLimit = parseInt(config.PostEditTimeLimit, 10);
    }

    return {
        channelIsArchived: isArchivedChannel(channel),
        components: state.plugins.components,
        postEditTimeLimit,
        isLicensed: getLicense(state).IsLicensed === 'true',
        teamId: getCurrentTeamId(state),
        pluginMenuItems: state.plugins.components.PostDropdownMenu,
        canEdit: PostUtils.canEditPost(state, post, license, config, channel, userId),
        canDelete: PostUtils.canDeletePost(state, post, channel),
        currentTeamUrl,
        appBindings,
        ...ownProps,
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
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DotMenu);
