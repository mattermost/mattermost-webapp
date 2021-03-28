// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'mattermost-redux/types/store';

import {canDownloadFiles} from 'utils/file_utils';

import ViewImage, {Props} from './view_image';

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
        enablePublicLink: config.EnablePublicLink === 'true',
        pluginFilePreviewComponents: state.plugins.components.FilePreview,
        post: ownProps.post || getPost(state, ownProps?.postId ? ownProps.postId : ''),
    };
}

export default connect(mapStateToProps)(ViewImage as React.ComponentClass);
