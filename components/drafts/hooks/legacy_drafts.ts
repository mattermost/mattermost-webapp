// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {batchActions} from 'redux-batched-actions';

import {getPost} from 'mattermost-redux/actions/posts';
import {DispatchFunc, GenericAction} from 'mattermost-redux/types/actions';

import {getAllPosts} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {makeGetDraftsByPrefix, DraftSelector} from 'selectors/drafts';
import {StoragePrefixes, StorageTypes} from 'utils/constants';

const getChannelDrafts: DraftSelector = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
const getThreadDrafts: DraftSelector = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);

// Drafts pre global drafts are missing the channel_id in the value
// thus making it hard to determine in which team they belong.
//
// This hook is fixing those drafts so they include the channel_id.
// The most trick part is that for drafts in threads we have to fetch the post since
// it's not guaranteed that they exist at mount.
// This should be an one-off.
export function useSyncLegacyDrafts(): void {
    const dispatch: DispatchFunc = useDispatch();
    const channelDrafts = useSelector(getChannelDrafts);
    const threadDrafts = useSelector(getThreadDrafts);
    const teamId = useSelector(getCurrentTeamId);
    const posts = useSelector(getAllPosts);

    useEffect(() => {
        const legacyDrafts = channelDrafts?.filter((draft) => !draft?.value?.channel_id);

        const actions: GenericAction[] = [];
        legacyDrafts.forEach((draft) => {
            const updatedValue = {...draft.value, channel_id: draft.id};
            localStorage.setItem(String(draft.key), JSON.stringify(updatedValue));

            actions.push({
                type: StorageTypes.SET_GLOBAL_ITEM,
                data: {
                    name: draft.key,
                    timestamp: new Date(),
                    value: updatedValue,
                },
            });
        });

        // Batch update storage drafts with updated draft shape
        dispatch(batchActions(actions));
    }, [channelDrafts, teamId]);

    useEffect(() => {
        const legacyDrafts = threadDrafts?.filter((draft) => !draft?.value?.channel_id);
        const actions: GenericAction[] = [];

        legacyDrafts.forEach(async (draft) => {
            if (posts[draft.id]) {
                const updatedValue = {...draft.value, channel_id: posts[draft.id].channel_id};
                localStorage.setItem(String(draft.key), JSON.stringify(updatedValue));

                actions.push({
                    type: StorageTypes.SET_GLOBAL_ITEM,
                    data: {
                        name: draft.key,
                        timestamp: new Date(),
                        value: updatedValue,
                    },
                });
            } else {
                const {data, error} = await dispatch(getPost(draft.id));

                if (!error && data) {
                    const updatedValue = {...draft.value, channel_id: data.channel_id};
                    localStorage.setItem(String(draft.key), JSON.stringify(updatedValue));

                    actions.push({
                        type: StorageTypes.SET_GLOBAL_ITEM,
                        data: {
                            name: draft.key,
                            timestamp: new Date(),
                            value: updatedValue,
                        },
                    });
                }
            }
        });

        // Batch update storage drafts with updated draft shape
        dispatch(batchActions(actions));
    }, [threadDrafts, teamId, posts]);
}
