// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {canDownloadFiles} from 'utils/file_utils.jsx';

import ViewImage from './view_image.jsx';
import {GlobalState} from 'types/store/index.js';
import {Post} from 'mattermost-redux/types/posts';

type OwnProps = {
    post: Post;
    postId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
        enablePublicLink: config.EnablePublicLink === 'true',
        pluginFilePreviewComponents: state.plugins.components.FilePreview,
        post: ownProps.post || getPost(state, ownProps.postId),
    };
}

export default connect(mapStateToProps)(ViewImage);
