// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {setGlobalItem} from 'actions/storage';
import {PostDraft} from 'types/store/rhs';

export function removeDraft(key: string) {
    return (dispatch: DispatchFunc) => {
        localStorage.removeItem(key);
        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));
    };
}

export function updateDraft(key: string, value: PostDraft|null) {
    let updatedValue = null;
    if (value) {
        const item = localStorage.getItem(key);
        const data = item ? JSON.parse(item) : {};
        updatedValue = {
            ...value,
            createAt: data.createAt || new Date(),
            updateAt: new Date(),
        };
        localStorage.setItem(key, JSON.stringify(updatedValue));
    } else {
        localStorage.removeItem(key);
    }

    return setGlobalItem(key, updatedValue);
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
        }
    };
}
