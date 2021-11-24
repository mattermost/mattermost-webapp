// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {Post} from 'mattermost-redux/types/posts';

import {getIsMobileView} from 'selectors/views/browser';

import {GlobalState} from 'types/store';
import {FilePreviewComponent} from 'types/store/plugins';

import {canDownloadFiles} from 'utils/file_utils';

import FilePreviewModal from './file_preview_modal';

type OwnProps = {
    post?: Post;
    postId?: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
        enablePublicLink: config.EnablePublicLink === 'true',
        isMobileView: getIsMobileView(state),
        pluginFilePreviewComponents: state.plugins.components.FilePreview as unknown as FilePreviewComponent[],
        post: ownProps.post || getPost(state, ownProps.postId || ''),
    };
}

export default connect(mapStateToProps)(FilePreviewModal);
