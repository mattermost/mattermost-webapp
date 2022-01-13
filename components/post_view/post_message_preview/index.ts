// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Post, PostPreviewMetadata} from 'mattermost-redux/types/posts';

import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {isEmbedVisible} from 'selectors/posts';

import {toggleEmbedVisibility} from 'actions/post_actions';

import {Preferences} from 'utils/constants';

import PostMessagePreview from './post_message_preview';

type Props = {
    metadata: PostPreviewMetadata;
    previewPost?: Post;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const config = getConfig(state);
    let user = null;
    let embedVisible = false;
    let previewPost = ownProps.previewPost;

    if (!previewPost) {
        previewPost = getPost(state, ownProps.metadata.post_id);
    }

    if (previewPost && previewPost.user_id) {
        user = getUser(state, previewPost.user_id);
    }
    if (previewPost && previewPost.id) {
        embedVisible = isEmbedVisible(state, previewPost.id);
    }

    return {
        hasImageProxy: config.HasImageProxy === 'true',
        enablePostIconOverride: config.EnablePostIconOverride === 'true',
        previewPost,
        user,
        isEmbedVisible: embedVisible,
        compactDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({toggleEmbedVisibility}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostMessagePreview);
