// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {removePost} from 'mattermost-redux/actions/posts';

import {Preferences} from 'utils/constants.jsx';
import {getSelectedPost, makeGetPostsEmbedVisibleObj} from 'selectors/rhs.jsx';

import RhsThread from './rhs_thread.jsx';

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();
    const getPostsEmbedVisibleObj = makeGetPostsEmbedVisibleObj();

    return function mapStateToProps(state) {
        const selected = getSelectedPost(state);

        let channel = null;
        let posts = [];
        if (selected) {
            posts = getPostsForThread(state, {rootId: selected.id});
            channel = getChannel(state, selected.channel_id);
        }

        const previewCollapsed = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT);
        const postsEmbedVisibleObj = getPostsEmbedVisibleObj(state, posts);

        return {
            selected,
            channel,
            posts,
            previewCollapsed,
            postsEmbedVisibleObj,
            previewEnabled: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            removePost,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(RhsThread);
