// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {editPost} from 'actions/views/posts';

import {getSelectedPostId} from 'selectors/rhs';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {closeRightHandSide} from 'actions/views/rhs';

import EditedPostItem, {Props} from './edited_post_item';

function mapStateToProps(state: GlobalState) {
    const selectedPostId = getSelectedPostId(state) || '';
    const post = getPost(state, selectedPostId);

    return {
        originalPost: post,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Props['actions']>({
            editPost,
            closeRightHandSide,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditedPostItem);
