// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {PostAction} from 'mattermost-redux/types/integration_actions';

import {GlobalState} from 'types/store';
import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';
import {selectAttachmentMenuAction} from 'actions/views/posts';

import ActionMenu from './action_menu';

type OwnProps = {
    postId: string;
    action: PostAction;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const actions = state.views.posts.menuActions[ownProps.postId];
    const selected = (ownProps.action && ownProps.action.id) ? actions && actions[ownProps.action && ownProps.action.id] : undefined;

    return {
        selected,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            selectAttachmentMenuAction,
            autocompleteChannels,
            autocompleteUsers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionMenu);
