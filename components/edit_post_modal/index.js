// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addMessageIntoHistory} from 'mattermost-redux/actions/posts';
import {Preferences} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {hideEditPostModal} from 'actions/post_actions';
import {editPost} from 'actions/views/edit_post_modal';
import {getEditingPost} from 'selectors/posts';

import EditPostModal from './edit_post_modal.jsx';

const mapStateToProps = (state) => ({
    ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
    config: getConfig(state),
    editingPost: getEditingPost(state)
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        addMessageIntoHistory,
        editPost,
        hideEditPostModal
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EditPostModal);
