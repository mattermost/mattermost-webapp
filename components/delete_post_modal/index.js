// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {deleteAndRemovePost} from 'actions/post_actions.jsx';

import DeletePostModal from './delete_post_modal.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deleteAndRemovePost,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(DeletePostModal);
