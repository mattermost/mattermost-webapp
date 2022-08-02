// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {makeGetFilesForPost} from 'mattermost-redux/selectors/entities/files';

import CommentedOnFilesMessage from './commented_on_files_message.jsx';

function makeMapStateToProps() {
    const selectFileInfosForPost = makeGetFilesForPost();

    return function mapStateToProps(state, ownProps) {
        let fileInfos;
        if (ownProps.parentPostId) {
            fileInfos = selectFileInfosForPost(state, ownProps.parentPostId);
        }

        return {
            fileInfos,
        };
    };
}

export default connect(makeMapStateToProps)(CommentedOnFilesMessage);
