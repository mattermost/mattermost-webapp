// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {removePost} from 'mattermost-redux/actions/posts';

import {createPost} from 'actions/post_actions.jsx';

import FailedPostOptions from './failed_post_options.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ...bindActionCreators({
                removePost,
            }, dispatch),
            createPost,
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FailedPostOptions);
