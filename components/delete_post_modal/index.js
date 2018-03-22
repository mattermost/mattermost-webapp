// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {deletePost} from 'mattermost-redux/actions/posts';

import DeletePostModal from './delete_post_modal.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deletePost,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(DeletePostModal);
