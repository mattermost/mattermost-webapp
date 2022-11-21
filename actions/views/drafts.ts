// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {syncedDraftsAreAllowedAndEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {Client4} from 'mattermost-redux/client';

import {setGlobalItem} from 'actions/storage';
import {getConnectionId} from 'selectors/general';
import type {GlobalState} from 'types/store';
import {PostDraft} from 'types/store/draft';
import {getGlobalItem} from 'selectors/storage';

import type {UserProfile} from '@mattermost/types/users';

export function removeDraft(key: string, channelId: string, rootId = '') {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;

        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));

        if (syncedDraftsAreAllowedAndEnabled(state)) {
            const connectionId = getConnectionId(getState() as GlobalState);
            await Client4.deleteDraft(channelId, rootId, connectionId);
        }
        return {data: true};
    };
}

export function updateDraft(key: string, value: PostDraft|null, rootId = '', save = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        let updatedValue: PostDraft|null = null;
        if (value) {
            const timestamp = new Date().getTime();
            const data = getGlobalItem(state, key, {});
            updatedValue = {
                ...value,
                createAt: data.createAt || timestamp,
                updateAt: timestamp,
                remote: false,
            };
        }

        dispatch(setGlobalItem(key, updatedValue));

        if (syncedDraftsAreAllowedAndEnabled(state) && save && updatedValue) {
            const connectionId = getConnectionId(state);
            const userId = getCurrentUserId(state);
            await upsertDraft(updatedValue, userId, rootId, connectionId);
        }
        return {data: true};
    };
}

function upsertDraft(draft: PostDraft, userId: UserProfile['id'], rootId = '', connectionId: string) {
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

    return Client4.upsertDraft(newDraft, connectionId);
}
