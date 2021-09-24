// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';
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

export type DraftSelector = (state: GlobalState) => Draft[];
export type DraftCountSelector = (state: GlobalState) => number;

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
                    item !== null &&
                    item.value != null &&
                    (item.value.message || item.value.fileInfos.length > 0)
                ) {
                    const {id, type} = getInfoFromKey(key, prefix);

                    // if channel doesn't belong to my channels
                    // it's probably a draft from another team
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

export function makeGetDrafts(): DraftSelector {
    const getChannelDrafts = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getRHSDrafts = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);

    return createSelector(
        'makeGetDrafts',
        getChannelDrafts,
        getRHSDrafts,
        (state: GlobalState) => getMyChannels(state).map((chan) => chan.id),
        (channelDrafts, rhsDrafts, myChannels) => {
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
            }).filter((draft) => myChannels.indexOf(draft.value.channelId) !== -1);
        },
    );
}

export function makeGetDraftsCount(): DraftCountSelector {
    const getChannelDrafts = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getRHSDrafts = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);
    return createSelector(
        'makeGetDraftsCount',
        getChannelDrafts,
        getRHSDrafts,
        (state: GlobalState) => getMyChannels(state).map((chan) => chan.id),
        (channelDrafts, rhsDrafts, myChannels) => [...channelDrafts, ...rhsDrafts].
            filter((draft) => myChannels.indexOf(draft.value.channelId) !== -1).length,
    );
}
