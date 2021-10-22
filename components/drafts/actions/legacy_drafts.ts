// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {getPost} from 'mattermost-redux/actions/posts';
import {DispatchFunc, GenericAction, GetStateFunc} from 'mattermost-redux/types/actions';

import {getAllPosts} from 'mattermost-redux/selectors/entities/posts';
import {makeGetDraftsByPrefix, DraftSelector} from 'selectors/drafts';
import {GlobalState} from 'types/store';
import {StoragePrefixes, StorageTypes} from 'utils/constants';

// Drafts pre global drafts are missing the channelId in the value
// thus making it hard to determine in which team they belong.
//
// This hook is fixing those drafts so they include the channelId.
// The most trick part is that for drafts in threads we have to fetch the post since
// it's not guaranteed that they exist at mount.
// This should be an one-off.
export function syncLegacyDrafts() {
    const getChannelDrafts: DraftSelector = makeGetDraftsByPrefix(StoragePrefixes.DRAFT);
    const getThreadDrafts: DraftSelector = makeGetDraftsByPrefix(StoragePrefixes.COMMENT_DRAFT);

    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;

        let posts = getAllPosts(state);
        const channelDrafts = getChannelDrafts(state);
        const threadDrafts = getThreadDrafts(state);
        const actions: GenericAction[] = [];
        const legacyChannelDrafts = channelDrafts?.filter((draft) => !draft?.value?.channelId);
        const legacyThreadDrafts = threadDrafts?.filter((draft) => !draft?.value?.channelId);

        // root post pre-fetching
        await legacyChannelDrafts.reduce(async (prevPromise, draft): Promise<any> => {
            await prevPromise;

            // do nothing if we already have the root post
            if (posts[draft.id]) {
                return Promise.resolve();
            }

            return dispatch(getPost(draft.id));
        }, Promise.resolve());

        // new posts state
        posts = getAllPosts(getState());

        legacyChannelDrafts.forEach((draft) => {
            const updatedValue = {...draft.value, channelId: draft.id};

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

        legacyThreadDrafts.forEach(async (draft) => {
            if (posts[draft.id]) {
                const updatedValue = {...draft.value, channelId: posts[draft.id].channel_id};

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
        });

        batchActions(actions);
    };
}
