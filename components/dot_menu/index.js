// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {flagPost, unflagPost} from 'mattermost-redux/actions/posts';

import {pinPost, unpinPost, setEditingPost} from 'actions/post_actions.jsx';

import DotMenu from './dot_menu.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        flagPost,
        unflagPost,
        setEditingPost,
        pinPost,
        unpinPost
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(DotMenu);
