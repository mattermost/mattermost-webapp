// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMissingFilesForPost} from 'mattermost-redux/actions/files';
import {makeGetFilesForPost} from 'mattermost-redux/selectors/entities/files';

import {get} from 'mattermost-redux/selectors/entities/preferences';

import {makeGetGlobalItem} from 'selectors/storage';

import {Preferences, StoragePrefixes} from 'utils/constants.jsx';

import FileAttachmentList from './file_attachment_list.jsx';

function makeMapStateToProps() {
    const selectFilesForPost = makeGetFilesForPost();

    return function mapStateToProps(state, ownProps) {
        const previewCollapsed = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT);
        const isEmbedVisible = makeGetGlobalItem(StoragePrefixes.EMBED_VISIBLE + ownProps.post.id, previewCollapsed.startsWith('false'))(state);

        const postId = ownProps.post ? ownProps.post.id : '';
        const fileInfos = selectFilesForPost(state, postId);

        let fileCount = 0;
        if (ownProps.post.file_ids) {
            fileCount = ownProps.post.file_ids.length;
        } else if (ownProps.post.filenames) {
            fileCount = ownProps.post.filenames.length;
        }

        return {
            ...ownProps,
            fileInfos,
            fileCount,
            isEmbedVisible,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMissingFilesForPost,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(FileAttachmentList);
