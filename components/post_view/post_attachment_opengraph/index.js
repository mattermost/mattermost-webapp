// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getOpenGraphMetadata} from 'mattermost-redux/actions/posts';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getOpenGraphMetadataForUrl} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {editPost} from 'actions/views/posts';

import PostAttachmentOpenGraph from './post_attachment_opengraph.jsx';

function mapStateToProps(state, ownProps) {
    return {
        currentUser: getCurrentUser(state),
        hasImageProxy: getConfig(state).HasImageProxy === 'true',
        openGraphData: getOpenGraphMetadataForUrl(state, ownProps.link),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            editPost,
            getOpenGraphMetadata,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAttachmentOpenGraph);
