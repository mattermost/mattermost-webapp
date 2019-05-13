// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getOpenGraphMetadataForUrl} from 'mattermost-redux/selectors/entities/posts';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {editPost} from 'actions/views/posts';

import {Preferences} from 'utils/constants';

import PostAttachmentOpenGraph from './post_attachment_opengraph.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);

    return {
        currentUser: getCurrentUser(state),
        enableLinkPreviews: config.EnableLinkPreviews === 'true',
        hasImageProxy: config.HasImageProxy === 'true',
        openGraphData: getOpenGraphMetadataForUrl(state, ownProps.link),
        previewEnabled: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, true),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            editPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAttachmentOpenGraph);
