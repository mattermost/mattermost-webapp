// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@mattermost/types/posts';
import type{Channel} from '@mattermost/types/channels';
import type{Draft} from '@mattermost/types/drafts';

import {DraftTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {PostDraft} from 'types/store/rhs';

import {logError} from './errors';
import {forceLogoutIfNecessary} from './helpers';

export function handleGetDrafts(draft: Draft[]) {
    return {
        type: DraftTypes.GET_USER_DRAFTS,
        payload: draft,
    };
}

export function handleUpdateDraft(draft: Draft) {
    return {
        type: DraftTypes.UPDATE_USER_DRAFT,
        payload: draft,
    };
}

export function handleUpsertDraft(draft: Draft) {
    return {
        type: DraftTypes.UPSERT_USER_DRAFT,
        payload: draft,
    };
}

export function handleCreateDraft(draft: Draft) {
    return {
        type: DraftTypes.CREATE_USER_DRAFT,
        payload: draft,
    };
}

export function handleDeleteDraft({channelId, rootId}: {channelId: Channel['id']; rootId: Post['id']}) {
    return {
        type: DraftTypes.DELETE_USER_DRAFT,
        payload: {channelId, rootId},
    };
}

export function upsertDraft(draft: PostDraft, rootId = '') {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const userId = getCurrentUserId(state);

        const fileIds = draft.fileInfos.map((file) => file.id);

        const newDraft = {
            create_at: draft.createAt || 0,
            update_at: draft.updateAt || 0,
            delete_at: 0,
            user_id: userId,
            channel_id: draft.channelId,
            root_id: draft.rootId || rootId,
            message: draft.message,
            props: draft.props,
            file_ids: fileIds,
        };
        try {
            await Client4.upsertDraft(newDraft);
        } catch (error) {
            dispatch({type: DraftTypes.UPSERT_DRAFT_FAILURE, payload: newDraft, error});
            return {data: false, error};
        }

        return {data: true};
    };
}

export function getDrafts(teamId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let drafts: Draft[] = [];

        try {
            drafts = await Client4.getUserDrafts(teamId);

            dispatch(handleGetDrafts(drafts));
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch({type: DraftTypes.GET_DRAFTS_FAILURE, error});
            dispatch(logError(error));
        }

        return {data: drafts};
    };
}

export function deleteDraft(channelId: string, rootId: string) {
    return async (dispatch: DispatchFunc) => {
        try {
            await Client4.deleteDraft(channelId, rootId);
        } catch (error) {
            dispatch({type: DraftTypes.DELETE_DRAFT_FAILURE, payload: {channelId, rootId}, error});
            return {data: false, error};
        }

        return {data: true};
    };
}
