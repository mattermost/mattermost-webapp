// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';
import {selectAttachmentMenuAction} from 'actions/views/posts';

import {PostAction} from '@mattermost/types/integration_actions';

import {ActionFunc} from 'mattermost-redux/types/actions';

import ActionMenu, {Props} from './action_menu';

export type OwnProps = {
    postId: string;
    action: PostAction;
    disabled?: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const actions = state.views.posts.menuActions[ownProps.postId];
    const selected = (ownProps.action && ownProps.action.id) ? actions && actions[ownProps.action && ownProps.action.id] : undefined;

    return {
        selected,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            selectAttachmentMenuAction,
            autocompleteChannels,
            autocompleteUsers,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ActionMenu);
