// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMissingFilesForPost} from 'mattermost-redux/actions/files';
import {makeGetFilesForPost} from 'mattermost-redux/selectors/entities/files';

import FileAttachmentList from './file_attachment_list.jsx';

const makeMapStateToProps = () => {
    const selectFilesForPost = makeGetFilesForPost();
    return (state, ownProps) => {
        const postId = ownProps.post ? ownProps.post.id : '';
        const fileInfos = selectFilesForPost(state, postId);

        let fileCount = 0;
        if (ownProps.post.file_ids) {
            fileCount = ownProps.post.file_ids.length;
        } else if (ownProps.post.filenames) {
            fileCount = ownProps.post.filenames.length;
        }

        return {
            fileInfos,
            fileCount
        };
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getMissingFilesForPost
    }, dispatch)
});

export default connect(makeMapStateToProps, mapDispatchToProps)(FileAttachmentList);
