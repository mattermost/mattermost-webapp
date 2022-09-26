// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {PostAction} from '@mattermost/types/integration_actions';

import {GlobalState} from 'types/store';
import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';
import {selectAttachmentMenuAction} from 'actions/views/posts';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Channel, UserProfile} from 'components/suggestion/command_provider/app_command_parser/app_command_parser_dependencies';

import ActionMenu from './action_menu';

export type OwnProps = {
    postId: string;
    action: PostAction;
    disabled?: boolean;
    actions?: {
        autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => Promise<void>;
        autocompleteUsers: (search: string) => Promise<UserProfile[]>;
        selectAttachmentMenuAction: (postId: any, actionId: any, cookie: any, dataSource: any, text: any, value: any) => (dispatch: any) => Promise<{
            data: boolean;
        }>;
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const actions = state.views.posts.menuActions[ownProps.postId];
    const selected = (ownProps.action && ownProps.action.id) ? actions && actions[ownProps.action && ownProps.action.id] : undefined;

    return {
        selected,
    };
}

type Actions = {
    autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => Promise<void>;
    autocompleteUsers: (search: string) => Promise<UserProfile[]>;
    selectAttachmentMenuAction: (postId: any, actionId: any, cookie: any, dataSource: any, text: any, value: any) => (dispatch: any) => Promise<{
        data: boolean;
    }>;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            selectAttachmentMenuAction,
            autocompleteChannels,
            autocompleteUsers,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ActionMenu);
