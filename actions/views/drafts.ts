// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import type {UserProfile} from '@mattermost/types/users';

import {setGlobalItem} from 'actions/storage';
import {PostDraft} from 'types/store/draft';

export function removeDraft(key: string, channelId: string, rootId = '') {
    return async (dispatch: DispatchFunc) => {
        localStorage.removeItem(key);
        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));
        await Client4.deleteDraft(channelId, rootId);

        return {data: true};
    };
}

export function updateDraft(key: string, value: PostDraft|null, rootId = '') {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let updatedValue: PostDraft|null = null;
        if (value) {
            const timestamp = new Date().getTime();
            const item = localStorage.getItem(key);
            const data = item ? JSON.parse(item) : {};
            updatedValue = {
                ...value,
                createAt: data.createAt || timestamp,
                updateAt: timestamp,
            };
            localStorage.setItem(key, JSON.stringify(updatedValue));

            const userId = getCurrentUserId(getState());
            if (updatedValue.show) {
                await upsertDraft(updatedValue, userId, rootId);
            }
        } else {
            localStorage.removeItem(key);
        }
        dispatch(setGlobalItem(key, updatedValue));
        return {data: true};
    };
}

export function removeFilePreview(key: string, id: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const item = localStorage.getItem(key);
        if (!item) {
            return;
        }
        const draft = JSON.parse(item) as PostDraft;

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

            localStorage.setItem(key, JSON.stringify(updatedDraft));
            dispatch(setGlobalItem(key, updatedDraft));

            const userId = getCurrentUserId(getState());
            await upsertDraft(updatedDraft, userId);
        }
    };
}

function upsertDraft(draft: PostDraft, userId: UserProfile['id'], rootId = '') {
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

    return Client4.upsertDraft(newDraft);
}
