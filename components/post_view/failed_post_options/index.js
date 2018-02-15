// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {removePost} from 'mattermost-redux/actions/posts';

import FailedPostOptions from './failed_post_options.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        removePost
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(FailedPostOptions);
