// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {syncedDraftsAreAllowedAndEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {Client4} from 'mattermost-redux/client';

import {setGlobalItem} from 'actions/storage';
import {getConnectionId} from 'selectors/general';
import type {GlobalState} from 'types/store';
import {PostDraft} from 'types/store/draft';
import {getGlobalItem} from 'selectors/storage';

import {StoragePrefixes} from 'utils/constants';

import type {Draft as ServerDraft} from '@mattermost/types/drafts';
import type {UserProfile} from '@mattermost/types/users';
import {PostMetadata, PostPriorityMetadata} from '@mattermost/types/posts';
import {FileInfo} from '@mattermost/types/files';

type Draft = {
    key: keyof GlobalState['storage']['storage'];
    value: PostDraft;
    timestamp: Date;
}

export function getDrafts(teamId: string) {
    return async (dispatch: DispatchFunc) => {
        let drafts: ServerDraft[] = [];
        drafts = await Client4.getUserDrafts(teamId);
        const actions = (drafts || []).map((draft) => {
            const {key, value} = transformServerDraft(draft);
            return setGlobalItem(key, value);
        });

        dispatch(batchActions(actions));
    };
}

export function removeDraft(key: string, channelId: string, rootId = '') {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;

        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));

        if (syncedDraftsAreAllowedAndEnabled(state)) {
            const connectionId = getConnectionId(getState() as GlobalState);

            try {
                await Client4.deleteDraft(channelId, rootId, connectionId);
            } catch (error) {
                return {
                    data: false,
                    error,
                };
            }
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
        priority: draft.metadata?.priority as PostPriorityMetadata,
    };

    return Client4.upsertDraft(newDraft, connectionId);
}

export function transformServerDraft(draft: ServerDraft): Draft {
    let key: Draft['key'] = `${StoragePrefixes.DRAFT}${draft.channel_id}`;

    if (draft.root_id !== '') {
        key = `${StoragePrefixes.COMMENT_DRAFT}${draft.root_id}`;
    }

    let fileInfos: FileInfo[] = [];
    if (draft.metadata?.files) {
        fileInfos = draft.metadata.files;
    }

    const metadata = (draft.metadata || {}) as PostMetadata;
    if (draft.priority) {
        metadata.priority = draft.priority;
    }

    return {
        key,
        timestamp: new Date(draft.update_at),
        value: {
            message: draft.message,
            fileInfos,
            props: draft.props,
            uploadsInProgress: [],
            channelId: draft.channel_id,
            rootId: draft.root_id,
            createAt: draft.create_at,
            updateAt: draft.update_at,
            metadata,
            show: true,
        },
    };
}
