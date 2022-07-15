// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {upsertDraft, deleteDraft} from 'mattermost-redux/actions/drafts';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {setGlobalItem} from 'actions/storage';
import {PostDraft} from 'types/store/rhs';

export function removeDraft(key: string, channelId: string, rootId = '') {
    return (dispatch: DispatchFunc) => {
        localStorage.removeItem(key);
        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));
        dispatch(deleteDraft(channelId, rootId));

        return {data: true};
    };
}

export function updateDraft(key: string, value: PostDraft|null, rootId = '') {
    return (dispatch: DispatchFunc) => {
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
            dispatch(upsertDraft(updatedValue, rootId));
        } else {
            localStorage.removeItem(key);
        }

        dispatch(setGlobalItem(key, updatedValue));

        return {data: true};
    };
}

export function removeFilePreview(key: string, id: string) {
    return (dispatch: DispatchFunc) => {
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
            dispatch(upsertDraft(updatedDraft));
        }
    };
}
