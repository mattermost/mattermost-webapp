// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getEditingPost} from 'selectors/posts';
import {setEditingPost} from 'actions/post_actions';
import {editPost, addMessageIntoHistory} from 'mattermost-redux/actions/posts';

import EditPostModal from './edit_post_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        config: getConfig(state),
        license: getLicense(state),
        editingPost: getEditingPost(state)
    };
}


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            editPost,
            setEditingPost,
            addMessageIntoHistory,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPostModal);
