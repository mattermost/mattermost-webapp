// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentUserLocale} from 'mattermost-redux/selectors/entities/i18n';

import {FileInfo, FileSearchResultItem} from 'mattermost-redux/types/files';
import {GlobalState} from 'mattermost-redux/types/store';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

function getAllFiles(state: GlobalState) {
    return state.entities.files.files;
}

function getAllFilesFromSearch(state: GlobalState) {
    return state.entities.files.filesFromSearch;
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

export const getSearchFilesResults: (state: GlobalState) => FileSearchResultItem[] = createSelector(
    getAllFilesFromSearch,
    (state: GlobalState) => state.entities.search.fileResults,
    (files, fileIds) => {
        if (!fileIds) {
            return [];
        }

        return fileIds.map((id) => files[id]);
    },
);

