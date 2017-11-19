// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import {StoragePrefixes, Preferences} from 'utils/constants.jsx';
import * as Selectors from 'selectors/rhs.jsx';

describe('Selectors.makeGetPostsEmbedVisibleObj', () => {
    let state;
    let getPostsEmbedVisibleObj;
    const posts = [{
        id: 'a'
    }, {
        id: 'b',
        root_id: 'a'
    }, {
        id: 'c',
        root_id: 'a'
    }];

    beforeEach(() => {
        state = {
            entities: {
                preferences: {
                    myPreferences: {
                        [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.COLLAPSE_DISPLAY}`]: {
                            category: 'display_settings',
                            name: 'collapse_previews',
                            value: 'true'
                        }
                    }
                },
                posts: {
                    posts: {
                        a: {
                            id: 'a'
                        },
                        b: {
                            id: 'b',
                            root_id: 's'
                        },
                        c: {
                            id: 'c',
                            root_id: 'a'
                        }
                    }
                }
            },
            storage: {
                [`${StoragePrefixes.EMBED_VISIBLE}c`]: false,
                [`${StoragePrefixes.EMBED_VISIBLE}d`]: false
            }
        };
    });

    it('Should return false for all posts', () => {
        getPostsEmbedVisibleObj = Selectors.makeGetPostsEmbedVisibleObj();

        const postsEmbedVisibleObj = {
            a: false,
            b: false,
            c: false
        };

        state = {
            ...state,
            storage: {
                ...state.storage,
                [`${StoragePrefixes.EMBED_VISIBLE}c`]: null
            }
        };

        assert.deepEqual(getPostsEmbedVisibleObj(state, posts), postsEmbedVisibleObj);
    });

    it('Should return true for all storage items', () => {
        getPostsEmbedVisibleObj = Selectors.makeGetPostsEmbedVisibleObj();
        const postsEmbedVisibleObj = {
            a: true,
            b: true,
            c: true
        };

        state = {
            ...state,
            storage: {},
            entities: {
                ...state.entities,
                preferences: {
                    ...state.entities.preferences,
                    myPreferences: {
                        ...state.entities.preferences.myPreferences,
                        [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.COLLAPSE_DISPLAY}`]: {
                            ...state.entities.preferences.myPreferences[`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.COLLAPSE_DISPLAY}`],
                            value: 'false'
                        }
                    }
                }
            }
        };

        assert.deepEqual(getPostsEmbedVisibleObj(state, posts), postsEmbedVisibleObj);
    });

    it('Should return false for all posts if previewCollapsed', () => {
        getPostsEmbedVisibleObj = Selectors.makeGetPostsEmbedVisibleObj();
        const postsEmbedVisibleObj = {
            a: false,
            b: false,
            c: false
        };

        assert.deepEqual(getPostsEmbedVisibleObj(state, posts), postsEmbedVisibleObj);
    });

    it('Memoization for single selector', () => {
        getPostsEmbedVisibleObj = Selectors.makeGetPostsEmbedVisibleObj();
        const postsEmbedVisibleObjPrevious = getPostsEmbedVisibleObj(state, posts);

        state = {
            ...state,
            somethingUnrelated: {}
        };

        const postsEmbedVisibleObjNew = getPostsEmbedVisibleObj(state, posts);
        assert.equal(postsEmbedVisibleObjNew, postsEmbedVisibleObjPrevious);
    });

    it('Memoization for multiple selectors', () => {
        const getPostsEmbedVisibleObj1 = Selectors.makeGetPostsEmbedVisibleObj();
        const getPostsEmbedVisibleObj2 = Selectors.makeGetPostsEmbedVisibleObj();

        let now1 = getPostsEmbedVisibleObj1(state, posts);
        let now2 = getPostsEmbedVisibleObj2(state, posts);
        assert.notEqual(now1, now2);
        assert.deepEqual(now1, now2);

        state = {
            ...state,
            storage: {
                ...state.storage,
                [`${StoragePrefixes.EMBED_VISIBLE}c`]: true
            }
        };

        let previous1 = now1;
        now1 = getPostsEmbedVisibleObj1(state, posts);
        now2 = getPostsEmbedVisibleObj2(state, posts);
        assert.notEqual(now1, now2);
        assert.deepEqual(now1, now2);

        state = {
            ...state,
            somethingUnrelated: {}
        };

        let previous2 = now2;
        previous1 = now1;
        now1 = getPostsEmbedVisibleObj1(state, posts);
        now2 = getPostsEmbedVisibleObj2(state, posts);
        assert.equal(now2, previous2);
        assert.equal(now1, previous1);

        state = {
            ...state,
            storage: {
                ...state.storage,
                [`${StoragePrefixes.EMBED_VISIBLE}d`]: false
            }
        };

        previous2 = now2;
        previous1 = now1;
        now1 = getPostsEmbedVisibleObj1(state, posts);
        now2 = getPostsEmbedVisibleObj2(state, posts);
        assert.notEqual(now1, previous1);
        assert.deepEqual(now1, previous1);
        assert.notEqual(now2, previous2);
        assert.deepEqual(now2, previous2);
    });
});
