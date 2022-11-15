// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {draftsAreEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {Client4} from 'mattermost-redux/client';

import {setGlobalItem} from 'actions/storage';
import {getConnectionId} from 'selectors/general';
import type {GlobalState} from 'types/store';
import {PostDraft} from 'types/store/draft';
import {StoragePrefixes} from 'utils/constants';
import {getGlobalItem} from 'selectors/storage';

import type {UserProfile} from '@mattermost/types/users';

export function removeDraft(key: string, channelId: string, rootId = '') {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;

        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));

        if (draftsAreEnabled(state)) {
            const connectionId = getConnectionId(getState() as GlobalState);
            await Client4.deleteDraft(channelId, rootId, connectionId);
        }
        return {data: true};
    };
}

export function updateDraft(key: string, value: PostDraft|null, rootId = '', save = false) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let updatedValue: PostDraft|null = null;
        if (value) {
            const state = getState() as GlobalState;
            const timestamp = new Date().getTime();
            const data = getGlobalItem(state, key, {});
            updatedValue = {
                ...value,
                createAt: data.createAt || timestamp,
                updateAt: timestamp,
                remote: false,
            };

            if (draftsAreEnabled(state) && save) {
                const connectionId = getConnectionId(state);
                const userId = getCurrentUserId(state);
                await upsertDraft(updatedValue, userId, rootId, connectionId);
            }
        }
        dispatch(setGlobalItem(key, updatedValue));
        return {data: true};
    };
}

export function removeFilePreview(key: string, id: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        const defaultValue = {};
        const draft = getGlobalItem(state, key, defaultValue) as PostDraft;
        if (draft === defaultValue) {
            return;
        }
        const connectionId = getConnectionId(state);

        const index = draft.fileInfos.findIndex((info) => info.id === id);

        if (index !== -1) {
            const fileInfos = [
                ...draft.fileInfos.slice(0, index),
                ...draft.fileInfos.slice(index + 1),
            ];

            const updatedDraft = {
                ...draft,
                fileInfos,
            };
            let rootId = '';
            if (key.startsWith(StoragePrefixes.COMMENT_DRAFT)) {
                rootId = id;
            }

            dispatch(setGlobalItem(key, updatedDraft));

            if (draftsAreEnabled(state)) {
                const userId = getCurrentUserId(state);
                await upsertDraft(updatedDraft, userId, rootId, connectionId);
            }
        }
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
