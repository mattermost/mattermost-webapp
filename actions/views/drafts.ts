// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {setGlobalItem} from 'actions/storage';
import {PostDraft} from 'types/store/rhs';

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
