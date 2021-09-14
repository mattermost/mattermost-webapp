// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';
import {getThreadsInCurrentTeam} from 'mattermost-redux/selectors/entities/threads';
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
};

function getInfoFromKey(key: string, prefix: string): Info {
    const keyArr = key.split('_');
    if (prefix === StoragePrefixes.DRAFT) {
        return {
            id: keyArr[1],
            type: 'channel',
        };
    }

    return {
        id: keyArr[2],
        type: 'thread',
    };
}

export function makeGetDraftsByPrefix(prefix: string) {
    return createSelector(
        'makeGetDraftsByPrefix',
        (state: GlobalState) => state.storage?.storage,
        (state: GlobalState) => {
            if (prefix === StoragePrefixes.DRAFT) {
                return getMyChannels(state).map((chan) => chan.id);
            }
            return getThreadsInCurrentTeam(state);
        },
        (storage, itemsInTeam) => {
            if (!storage) {
                return [];
            }

            return Object.keys(storage).flatMap((key) => {
                const item = storage[key];
                if (
                    key.startsWith(prefix) &&
                    item !== null &&
                    item.value != null
                ) {
                    const {id, type} = getInfoFromKey(key, prefix);

                    if (itemsInTeam.indexOf(id) === -1) {
                        return [];
                    }

                    return {
                        ...item,
                        key,
                        id,
                        type,
                    };
                }
                return [];
            });
        },
    );
}

export function makeGetDrafts(): (state: GlobalState) => Draft[] {
    const getChannelDrafts = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getRHSDrafts = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);

    return createSelector(
        'makeGetDrafts',
        getChannelDrafts,
        getRHSDrafts,
        (channelDrafts, rhsDrafts) => {
            const drafts = [
                ...channelDrafts,
                ...rhsDrafts,
            ];

            return drafts.sort((a, b) => {
                if (a.value.createAt < b.value.createAt) {
                    return 1;
                }

                if (a.value.createAt > b.value.createAt) {
                    return -1;
                }

                return 0;
            }).filter((draft) => draft.value.message || draft.value.fileInfos.length > 0);
        },
    );
}

export function makeGetDraftsCount() {
    const getChannelDrafts = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getRHSDrafts = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);
    return createSelector(
        'makeGetDraftsCount',
        getChannelDrafts,
        getRHSDrafts,
        (channelDrafts, rhsDrafts) => [...channelDrafts, ...rhsDrafts].
            filter((draft) => draft.value.message || draft.value.fileInfos.length > 0).length,
    );
}
