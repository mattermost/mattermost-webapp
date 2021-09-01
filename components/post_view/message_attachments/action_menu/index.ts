// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, ActionResult, DispatchFunc, GenericAction, GetStateFunc} from 'mattermost-redux/types/actions';
import {PostAction} from 'mattermost-redux/types/integration_actions';

import {GlobalState} from 'types/store';
import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';
import {selectAttachmentMenuAction} from 'actions/views/posts';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {ServerError} from 'mattermost-redux/types/errors';

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

type Error = ServerError & {id: string};

// (search: string) => Promise<UserProfile[]>;
export type AutocompleteUsersAction =
    (search: string) => Promise<UserProfile[]>;

export type AutocompleteChannelsAction = (
    term: string,
    success: (channels: Channel[]) => void,
    error: (error: Error) => void
) => (dispatch: DispatchFunc, getState: GetStateFunc) => Promise<void>;

export type SelectAttachmentMenuAction = (
    postId: string,
    actionId: string,
    cookie: string,
    dataSource: string | undefined,
    text: string,
    value: string
) => (dispatch: DispatchFunc) => Promise<ActionResult>;

type Actions = {
    autocompleteChannels: AutocompleteChannelsAction;
    selectAttachmentMenuAction: SelectAttachmentMenuAction;
    autocompleteUsers: AutocompleteUsersAction;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            autocompleteChannels,
            selectAttachmentMenuAction,
            autocompleteUsers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionMenu);
