// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {canDownloadFiles} from 'utils/file_utils.jsx';
import {showGetPublicLinkModal} from 'actions/global_actions.jsx';

import ViewImage from './view_image.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
        enablePublicLink: config.EnablePublicLink === 'true',
        pluginFilePreviewComponents: state.plugins.components.FilePreview,
        post: ownProps.post || getPost(state, ownProps.postId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showGetPublicLinkModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewImage);
