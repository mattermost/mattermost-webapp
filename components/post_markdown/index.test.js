// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';

import {makeGetMentionKeysForPost} from './index';

describe('makeGetMentionKeysForPost', () => {
    const getMentionKeysForPost = makeGetMentionKeysForPost();
    it('should return all mentionKeys', () => {
        const post = {
            props: {
                disable_group_highlight: false,
                mentionHighlightDisabled: false,
            },
        };
        const state = {
            entities: {
                users: {
                    currentUserId: 'a123',
                    profiles: {
                        a123: {
                            username: 'a123',
                            notify_props: {
                                channel: 'true',
                            },
                        },
                    },
                },
                groups: {
                    myGroups: {
                        developers: {
                            id: 123,
                            name: 'developers',
                            allow_reference: true,
                            delete_at: 0,
                        },
                    },
                },
            },
        };

        const results = getMentionKeysForPost(state, post);
        const expected = [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@a123'}, {key: '@developers'}];
        assert.deepEqual(results, expected);
    });

    it('should return mentionKeys without groups', () => {
        const post = {
            props: {
                disable_group_highlight: true,
                mentionHighlightDisabled: false,
            },
        };
        const state = {
            entities: {
                users: {
                    currentUserId: 'a123',
                    profiles: {
                        a123: {
                            username: 'a123',
                            notify_props: {
                                channel: 'true',
                            },
                        },
                    },
                },
                groups: {
                    myGroups: {
                        developers: {
                            id: 123,
                            name: 'developers',
                            allow_reference: true,
                            delete_at: 0,
                        },
                    },
                },
            },
        };
        const results = getMentionKeysForPost(state, post);
        const expected = [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@a123'}];
        assert.deepEqual(results, expected);
    });

    it('should return group mentions and all mentions without channel mentions', () => {
        const post = {
            props: {
                disable_group_highlight: false,
                mentionHighlightDisabled: true,
            },
        };
        const state = {
            entities: {
                users: {
                    currentUserId: 'a123',
                    profiles: {
                        a123: {
                            username: 'a123',
                            notify_props: {
                                channel: 'true',
                            },
                        },
                    },
                },
                groups: {
                    myGroups: {
                        developers: {
                            id: 123,
                            name: 'developers',
                            allow_reference: true,
                            delete_at: 0,
                        },
                    },
                },
            },
        };
        const results = getMentionKeysForPost(state, post);
        const expected = [{key: '@a123'}, {key: '@developers'}];
        assert.deepEqual(results, expected);
    });

    it('should return all mentions without group mentions and channel mentions', () => {
        const post = {
            props: {
                disable_group_highlight: true,
                mentionHighlightDisabled: true,
            },
        };
        const state = {
            entities: {
                users: {
                    currentUserId: 'a123',
                    profiles: {
                        a123: {
                            username: 'a123',
                            notify_props: {
                                channel: 'true',
                            },
                        },
                    },
                },
                groups: {
                    myGroups: {
                        developers: {
                            id: 123,
                            name: 'developers',
                            allow_reference: true,
                            delete_at: 0,
                        },
                    },
                },
            },
        };
        const results = getMentionKeysForPost(state, post);
        const expected = [{key: '@a123'}];
        assert.deepEqual(results, expected);
    });
});
