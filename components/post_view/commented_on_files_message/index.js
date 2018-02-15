// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getFilesForPost} from 'mattermost-redux/actions/files';
import {makeGetFilesForPost} from 'mattermost-redux/selectors/entities/files';

import CommentedOnFilesMessage from './commented_on_files_message.jsx';

const makeMapStateToProps = () => {
    const selectFileInfosForPost = makeGetFilesForPost();

    return (state, ownProps) => {
        let fileInfos;
        if (ownProps.parentPostId) {
            fileInfos = selectFileInfosForPost(state, ownProps.parentPostId);
        }

        return {
            fileInfos
        };
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getFilesForPost
    }, dispatch)
});

export default connect(makeMapStateToProps, mapDispatchToProps)(CommentedOnFilesMessage);
