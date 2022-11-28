// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {Client4} from 'mattermost-redux/client';
import type {DispatchFunc} from 'mattermost-redux/types/actions';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

import {setGlobalItem} from 'actions/storage';
import {StoragePrefixes} from 'utils/constants';

import {FileInfo} from '@mattermost/types/files';
import type {Draft as ServerDraft} from '@mattermost/types/drafts';

export type Draft = {
    key: keyof GlobalState['storage']['storage'];
    value: PostDraft;
    timestamp: Date;
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
            show: true,
        },
    };
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
