// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from 'mattermost-redux/types/posts';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {canEditPost} from 'mattermost-redux/utils/post_utils';

import {openModal} from 'actions/views/modals';

import EditPostModal from 'components/edit_post_modal';

import {ModalIdentifiers} from 'utils/constants';

export function openEditPostModal(postId: Post['id'], refocusId = '', isRHS = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const post = getPost(state, postId);

        if (!post || post.pending_post_id === postId) {
            return {data: false};
        }

        const config = state.entities.general.config;
        const license = state.entities.general.license;
        const userId = getCurrentUserId(state);
        const channel = getChannel(state, post.channel_id);
        const teamId = channel.team_id || '';

        const isPostEditable = canEditPost(
            state,
            config,
            license,
            teamId,
            post.channel_id,
            userId,
            post,
        );

        if (isPostEditable) {
            dispatch(
                openModal({
                    modalId: ModalIdentifiers.EDIT_POST,
                    dialogType: EditPostModal,
                    dialogProps: {
                        post,
                        refocusId,
                        isRHS,
                    },
                }),
            );
        }

        return {data: isPostEditable};
    };
}
