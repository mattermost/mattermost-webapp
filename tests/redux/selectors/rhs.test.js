// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import {get} from 'mattermost-redux/selectors/entities/preferences';
import {makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';

import {Preferences, StoragePrefixes} from 'utils/constants.jsx';
import * as Selectors from 'selectors/rhs.jsx';

describe('Selectors.makeGetPostsEmbedVisibleObj', () => {
    const state = {
        entities: {
            preferences: {
                myPreferences: {
                    [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.COLLAPSE_DISPLAY}`]: {
                        category: 'display_settings',
                        name: 'collapse_previews',
                        value: 'false'
                    }
                }
            },
            posts: {
                posts: {
                    '6qbyjghyfi8r3nq8mh46csipbh': {
                        id: '6qbyjghyfi8r3nq8mh46csipbh'
                    },
                    ff17oof87bgyun9bsouffsp34a: {
                        id: 'ff17oof87bgyun9bsouffsp34a'
                    }
                }
            }
        },
        storage: {
            [`${StoragePrefixes.EMBED_VISIBLE}w4o3t58hkb8p8ypxed54sddnrr`]: false,
            [`${StoragePrefixes.EMBED_VISIBLE}ff17oof87bgyun9bsouffsp34a`]: false
        }
    };

    it('makeGetItem', () => {
        const getPostsForThread = makeGetPostsForThread();
        const selected = Selectors.getSelectedPost(state);

        const previewCollapsed = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, 'false');
        const getPostsEmbedVisibleObj = Selectors.makeGetPostsEmbedVisibleObj();
        const posts = getPostsForThread(state, {rootId: selected.id, channelId: selected.channel_id});
        const postsEmbedVisibleObj = {
            '6qbyjghyfi8r3nq8mh46csipbh': false,
            ff17oof87bgyun9bsouffsp34a: false
        };

        assert.equal(getPostsEmbedVisibleObj(state, {previewCollapsed, posts}), postsEmbedVisibleObj);
    });
});
