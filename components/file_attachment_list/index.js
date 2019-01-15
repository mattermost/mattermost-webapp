// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMissingFilesForPost} from 'mattermost-redux/actions/files';
import {makeGetFilesForPost} from 'mattermost-redux/selectors/entities/files';

import {getCurrentLocale} from 'selectors/i18n';
import {isEmbedVisible} from 'selectors/posts';

import FileAttachmentList from './file_attachment_list.jsx';

function makeMapStateToProps() {
    const selectFilesForPost = makeGetFilesForPost();

    return function mapStateToProps(state, ownProps) {
        const postId = ownProps.post ? ownProps.post.id : '';
        const fileInfos = selectFilesForPost(state, postId);

        let fileCount = 0;
        if (ownProps.post.metadata) {
            fileCount = (ownProps.post.metadata.files || []).length;
        } else if (ownProps.post.file_ids) {
            fileCount = ownProps.post.file_ids.length;
        } else if (ownProps.post.filenames) {
            fileCount = ownProps.post.filenames.length;
        }

        return {
            fileInfos,
            fileCount,
            isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
            locale: getCurrentLocale(state),
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
