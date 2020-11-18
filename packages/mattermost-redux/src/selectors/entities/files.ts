// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentUserLocale} from '../../selectors/entities/i18n';

import {FileInfo} from '../../types/files';
import {GlobalState} from '../../types/store';

import {sortFileInfos} from '../../utils/file_utils';

function getAllFiles(state: GlobalState) {
    return state.entities.files.files;
}

function getFilesIdsForPost(state: GlobalState, postId: string) {
    if (postId) {
        return state.entities.files.fileIdsByPostId[postId] || [];
    }

    return [];
}

export function getFilePublicLink(state: GlobalState) {
    return state.entities.files.filePublicLink;
}

export function makeGetFilesForPost(): (state: GlobalState, postId: string) => FileInfo[] {
    return createSelector(
        getAllFiles,
        getFilesIdsForPost,
        getCurrentUserLocale,
        (allFiles, fileIdsForPost, locale) => {
            const fileInfos = fileIdsForPost.map((id) => allFiles[id]).filter((id) => Boolean(id));

            return sortFileInfos(fileInfos, locale);
        },
    );
}
