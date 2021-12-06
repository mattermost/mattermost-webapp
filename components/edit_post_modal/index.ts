// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {Post} from 'mattermost-redux/types/posts';
import {Action, ActionResult} from 'mattermost-redux/types/actions';
import {addMessageIntoHistory} from 'mattermost-redux/actions/posts';
import {Preferences, Permissions} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import {ModalData} from 'types/actions';
import {openModal} from 'actions/views/modals';
import {editPost} from 'actions/views/posts';
import {runMessageWillBeUpdatedHooks} from 'actions/hooks';
import Constants from 'utils/constants';
import {isPostOwner} from 'utils/post_utils';

import EditPostModal from './edit_post_modal';

export interface OwnProps {
    post: Post;
    refocusId: string;
    title: string;
    isRHS: boolean;
    onExited: () => void;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const channelId = ownProps.post.channel_id || getCurrentChannelId(state);
    const teamId = getCurrentTeamId(state);

    let canDeletePost = false;
    let canEditPost = false;

    if (isPostOwner(state, ownProps.post)) {
        canDeletePost = haveIChannelPermission(state, teamId, channelId, Permissions.DELETE_POST);
        canEditPost = haveIChannelPermission(state, teamId, channelId, Permissions.EDIT_POST);
    } else {
        canDeletePost = haveIChannelPermission(state, teamId, channelId, Permissions.DELETE_OTHERS_POSTS);
        canEditPost = haveIChannelPermission(state, teamId, channelId, Permissions.EDIT_OTHERS_POSTS);
    }

    const useChannelMentions = haveIChannelPermission(state, teamId, channelId, Permissions.USE_CHANNEL_MENTIONS);

    return {
        canEditPost,
        canDeletePost,
        codeBlockOnCtrlEnter: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        config,
        channelId,
        maxPostSize: parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT,
        useChannelMentions,
    };
}

type Actions = {
    addMessageIntoHistory: (message: string) => void;
    editPost: (input: Partial<Post>) => Promise<Post>;
    openModal: <P>(modalData: ModalData<P>) => void;
    runMessageWillBeUpdatedHooks: (newPost: Post, oldPost: Post) => Promise<ActionResult>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            addMessageIntoHistory,
            editPost,
            openModal,
            runMessageWillBeUpdatedHooks,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EditPostModal);
