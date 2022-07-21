// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import type {Draft as ServerDraft} from '@mattermost/types/drafts';

import {getMyActiveChannelIds} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';
import {PostDraft} from 'types/store/rhs';

import {StoragePrefixes} from 'utils/constants';

type Info = {
    id: string;
    type: 'channel' | 'thread';
}

export type Draft = Info & {
    key: keyof GlobalState['storage']['storage'];
    value: PostDraft;
    timestamp: Date;
}

export type DraftSelector = (state: GlobalState) => Draft[];
export type DraftCountSelector = (state: GlobalState) => number;

function getInfoFromKey(key: string, prefix: string): Info|null {
    const keyArr = key.split('_');
    if (prefix === StoragePrefixes.DRAFT) {
        return {
            id: keyArr[1],
            type: 'channel',
        };
    }

    if (prefix === StoragePrefixes.COMMENT_DRAFT) {
        return {
            id: keyArr[2],
            type: 'thread',
        };
    }

    return null;
}

export function makeGetDraftsByPrefix(prefix: string): DraftSelector {
    return createSelector(
        'makeGetDraftsByPrefix',
        (state: GlobalState) => state.storage?.storage,
        (storage) => {
            if (!storage) {
                return [];
            }

            return Object.keys(storage).flatMap((key) => {
                const item = storage[key];
                if (
                    key.startsWith(prefix) &&
                    item != null &&
                    item.value != null &&
                    (item.value.message || item.value.fileInfos?.length > 0) &&
                    item.value.show
                ) {
                    const info = getInfoFromKey(key, prefix);

                    if (info === null || !info.id) {
                        return [];
                    }

                    return {
                        ...item,
                        key,
                        id: info.id,
                        type: info.type,
                    };
                }
                return [];
            });
        },
    );
}

export function makeGetDrafts(): DraftSelector {
    const getChannelDrafts = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getRHSDrafts = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);

    return createSelector(
        'makeGetDrafts',
        getChannelDrafts,
        getRHSDrafts,
        getMyActiveChannelIds,
        (channelDrafts, rhsDrafts, myChannels) => (
            [...channelDrafts, ...rhsDrafts]
        ).
            filter((draft) => myChannels.indexOf(draft.value.channelId) !== -1).
            sort((a, b) => b.value.updateAt - a.value.updateAt),
    );
}

export function makeGetDraftsCount(): DraftCountSelector {
    const getChannelDrafts = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getRHSDrafts = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);
    return createSelector(
        'makeGetDraftsCount',
        getChannelDrafts,
        getRHSDrafts,
        getMyActiveChannelIds,
        (channelDrafts, rhsDrafts, myChannels) => [...channelDrafts, ...rhsDrafts].
            filter((draft) => myChannels.indexOf(draft.value.channelId) !== -1).length,
    );
}
