// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {PostTypes} from 'mattermost-redux/constants/posts';
import {Permissions} from '../constants';

import {
    canEditPost,
    isSystemMessage,
    shouldIgnorePost,
    isMeMessage,
    isUserActivityPost,
    shouldFilterJoinLeavePost,
    isPostCommentMention,
    getEmbedFromMetadata,
    shouldUpdatePost,
} from 'mattermost-redux/utils/post_utils';

describe('PostUtils', () => {
    describe('shouldFilterJoinLeavePost', () => {
        it('show join/leave posts', () => {
            const showJoinLeave = true;

            assert.equal(shouldFilterJoinLeavePost({type: ''}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.CHANNEL_DELETED}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.DISPLAYNAME_CHANGE}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.CONVERT_CHANNEL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.EPHEMERAL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.HEADER_CHANGE}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.PURPOSE_CHANGE}, showJoinLeave), false);

            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_LEAVE}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_CHANNEL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_CHANNEL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_REMOVE}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_CHANNEL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_CHANNEL}, showJoinLeave), false);

            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_TEAM}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_TEAM}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_TEAM}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_TEAM}, showJoinLeave), false);
        });

        it('hide join/leave posts', () => {
            const showJoinLeave = false;

            assert.equal(shouldFilterJoinLeavePost({type: ''}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.CHANNEL_DELETED}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.DISPLAYNAME_CHANGE}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.CONVERT_CHANNEL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.EPHEMERAL}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.HEADER_CHANGE}, showJoinLeave), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.PURPOSE_CHANGE}, showJoinLeave), false);

            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_LEAVE}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_CHANNEL}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_CHANNEL}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_REMOVE}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_CHANNEL}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_CHANNEL}, showJoinLeave), true);

            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_TEAM}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_TEAM}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_TEAM}, showJoinLeave), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_TEAM}, showJoinLeave), true);
        });

        it('always join/leave posts for the current user', () => {
            const username = 'user1';
            const otherUsername = 'user2';
            const showJoinLeave = false;

            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_CHANNEL, props: {username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_CHANNEL, props: {username: otherUsername}}, showJoinLeave, username), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_CHANNEL, props: {username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_CHANNEL, props: {username: otherUsername}}, showJoinLeave, username), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_CHANNEL, props: {username, addedUsername: otherUsername}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_CHANNEL, props: {username: otherUsername, addedUsername: username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_CHANNEL, props: {username: otherUsername, addedUsername: otherUsername}}, showJoinLeave, username), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_CHANNEL, props: {removedUsername: username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_CHANNEL, props: {removedUsername: otherUsername}}, showJoinLeave, username), true);

            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_TEAM, props: {username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.JOIN_TEAM, props: {username: otherUsername}}, showJoinLeave, username), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_TEAM, props: {username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.LEAVE_TEAM, props: {username: otherUsername}}, showJoinLeave, username), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_TEAM, props: {username, addedUsername: otherUsername}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_TEAM, props: {username: otherUsername, addedUsername: username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.ADD_TO_TEAM, props: {username: otherUsername, addedUsername: otherUsername}}, showJoinLeave, username), true);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_TEAM, props: {removedUsername: username}}, showJoinLeave, username), false);
            assert.equal(shouldFilterJoinLeavePost({type: PostTypes.REMOVE_FROM_TEAM, props: {removedUsername: otherUsername}}, showJoinLeave, username), true);
        });
    });

    describe('canEditPost', () => {
        const licensed = {IsLicensed: 'true'};
        const teamId = 'team-id';
        const channelId = 'channel-id';
        const userId = 'user-id';

        it('should work with new permissions version', () => {
            let newVersionState = {
                entities: {
                    general: {
                        serverVersion: '4.9.0',
                    },
                    users: {
                        currentUserId: userId,
                        profiles: {
                            'user-id': {roles: 'system_role'},
                        },
                    },
                    teams: {
                        currentTeamId: teamId,
                        myMembers: {
                            'team-id': {roles: 'team_role'},
                        },
                    },
                    channels: {
                        currentChannelId: channelId,
                        myMembers: {
                            'channel-id': {roles: 'channel_role'},
                        },
                        roles: {
                            'channel-id': ['channel_role'],
                        },
                    },
                    roles: {
                        roles: {
                            system_role: {
                                permissions: [],
                            },
                            team_role: {
                                permissions: [],
                            },
                            channel_role: {
                                permissions: [],
                            },
                        },
                    },
                },
            };

            // With new permissions
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: [Permissions.EDIT_POST]},
                    team_role: {permissions: []},
                    channel_role: {permissions: []},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: []},
                    team_role: {permissions: [Permissions.EDIT_POST]},
                    channel_role: {permissions: []},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: []},
                    team_role: {permissions: []},
                    channel_role: {permissions: [Permissions.EDIT_POST]},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: [Permissions.EDIT_OTHERS_POSTS]},
                    team_role: {permissions: []},
                    channel_role: {permissions: []},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: []},
                    team_role: {permissions: [Permissions.EDIT_OTHERS_POSTS]},
                    channel_role: {permissions: []},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: []},
                    team_role: {permissions: []},
                    channel_role: {permissions: [Permissions.EDIT_OTHERS_POSTS]},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: [Permissions.EDIT_OTHERS_POSTS, Permissions.EDIT_POST]},
                    team_role: {permissions: []},
                    channel_role: {permissions: []},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: []},
                    team_role: {permissions: [Permissions.EDIT_OTHERS_POSTS, Permissions.EDIT_POST]},
                    channel_role: {permissions: []},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));

            newVersionState.entities.roles = {
                roles: {
                    system_role: {permissions: []},
                    team_role: {permissions: []},
                    channel_role: {permissions: [Permissions.EDIT_OTHERS_POSTS, Permissions.EDIT_POST]},
                },
            };
            newVersionState = {...newVersionState};
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: userId}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: userId, create_at: Date.now() - 6000000}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: -1}, licensed, teamId, channelId, userId, {user_id: 'other'}));
            assert.ok(canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 100}));
            assert.ok(!canEditPost(newVersionState, {PostEditTimeLimit: 300}, licensed, teamId, channelId, userId, {user_id: 'other', create_at: Date.now() - 6000000}));
        });
    });

    describe('isSystemMessage', () => {
        it('should identify if post is system message', () => {
            const testCases = [
                {input: {type: ''}, output: false},

                {input: {type: PostTypes.CHANNEL_DELETED}, output: true},
                {input: {type: PostTypes.CHANNEL_UNARCHIVED}, output: true},
                {input: {type: PostTypes.DISPLAYNAME_CHANGE}, output: true},
                {input: {type: PostTypes.CONVERT_CHANNEL}, output: true},
                {input: {type: PostTypes.EPHEMERAL}, output: true},
                {input: {type: PostTypes.EPHEMERAL_ADD_TO_CHANNEL}, output: true},
                {input: {type: PostTypes.HEADER_CHANGE}, output: true},
                {input: {type: PostTypes.PURPOSE_CHANGE}, output: true},

                {input: {type: PostTypes.JOIN_LEAVE}, output: true}, // deprecated system type
                {input: {type: PostTypes.ADD_REMOVE}, output: true}, // deprecated system type

                {input: {type: PostTypes.COMBINED_USER_ACTIVITY}, output: true},

                {input: {type: PostTypes.ADD_TO_CHANNEL}, output: true},
                {input: {type: PostTypes.JOIN_CHANNEL}, output: true},
                {input: {type: PostTypes.LEAVE_CHANNEL}, output: true},
                {input: {type: PostTypes.REMOVE_FROM_CHANNEL}, output: true},
                {input: {type: PostTypes.ADD_TO_TEAM}, output: true},
                {input: {type: PostTypes.JOIN_TEAM}, output: true},
                {input: {type: PostTypes.LEAVE_TEAM}, output: true},
                {input: {type: PostTypes.REMOVE_FROM_TEAM}, output: true},
            ];

            testCases.forEach((testCase) => {
                assert.equal(
                    isSystemMessage(testCase.input),
                    testCase.output,
                    `isSystemMessage('${testCase.input}') should return ${testCase.output}`,
                );
            });
        });
    });

    describe('shouldIgnorePost', () => {
        it('should return false if system message is adding current user', () => {
            const currentUserId = 'czduet3upjfupy9xnqswrxaqea';
            const post = {
                type: PostTypes.ADD_TO_CHANNEL,
                user_id: 'anotherUserId',
                props: {
                    addedUserId: 'czduet3upjfupy9xnqswrxaqea',
                },
            };
            const evalShouldIgnorePost = shouldIgnorePost(post, currentUserId);
            assert.equal(evalShouldIgnorePost, false);
        });
        it('should return true if system message is adding a different user', () => {
            const currentUserId = 'czduet3upjfupy9xnqswrxaqea';
            const post = {
                type: PostTypes.ADD_TO_CHANNEL,
                props: {
                    addedUserId: 'mrbijaq9mjr3ue569kake9m6do',
                },
            };
            const evalShouldIgnorePost = shouldIgnorePost(post, currentUserId);
            assert.equal(evalShouldIgnorePost, true);
        });
    });

    describe('isUserActivityPost', () => {
        it('should identify if post is user activity - add/remove/join/leave channel/team', () => {
            const testCases = [
                {input: '', output: false},
                {input: null, output: false},

                {input: PostTypes.CHANNEL_DELETED, output: false},
                {input: PostTypes.DISPLAYNAME_CHANGE, output: false},
                {input: PostTypes.CONVERT_CHANNEL, output: false},
                {input: PostTypes.EPHEMERAL, output: false},
                {input: PostTypes.EPHEMERAL_ADD_TO_CHANNEL, output: false},
                {input: PostTypes.HEADER_CHANGE, output: false},
                {input: PostTypes.PURPOSE_CHANGE, output: false},

                {input: PostTypes.JOIN_LEAVE, output: false}, // deprecated system type
                {input: PostTypes.ADD_REMOVE, output: false}, // deprecated system type

                {input: PostTypes.COMBINED_USER_ACTIVITY, output: false},

                {input: PostTypes.ADD_TO_CHANNEL, output: true},
                {input: PostTypes.JOIN_CHANNEL, output: true},
                {input: PostTypes.LEAVE_CHANNEL, output: true},
                {input: PostTypes.REMOVE_FROM_CHANNEL, output: true},
                {input: PostTypes.ADD_TO_TEAM, output: true},
                {input: PostTypes.JOIN_TEAM, output: true},
                {input: PostTypes.LEAVE_TEAM, output: true},
                {input: PostTypes.REMOVE_FROM_TEAM, output: true},
            ];

            testCases.forEach((testCase) => {
                assert.equal(
                    isUserActivityPost(testCase.input),
                    testCase.output,
                    `isUserActivityPost('${testCase.input}') should return ${testCase.output}`,
                );
            });
        });
    });

    describe('isPostCommentMention', () => {
        const currentUser = {
            id: 'currentUser',
            notify_props: {
                comments: 'any',
            },
        };
        it('should return true as root post is by user', () => {
            const post = {
                user_id: 'someotherUser',
            };

            const rootPost = {
                user_id: 'currentUser',
            };

            const isCommentMention = isPostCommentMention({currentUser, post, rootPost, threadRepliedToByCurrentUser: false});
            assert.equal(isCommentMention, true);
        });

        it('should return false as root post is not by user and did not participate in thread', () => {
            const post = {
                user_id: 'someotherUser',
            };

            const rootPost = {
                user_id: 'differentUser',
            };

            const isCommentMention = isPostCommentMention({currentUser, post, rootPost, threadRepliedToByCurrentUser: false});
            assert.equal(isCommentMention, false);
        });

        it('should return false post is by current User', () => {
            const post = {
                user_id: 'currentUser',
            };

            const rootPost = {
                user_id: 'differentUser',
            };

            const isCommentMention = isPostCommentMention({currentUser, post, rootPost, threadRepliedToByCurrentUser: false});
            assert.equal(isCommentMention, false);
        });

        it('should return true as post is by current User but it is a webhhok and user participated in thread', () => {
            const post = {
                user_id: 'currentUser',
                props: {
                    from_webhook: true,
                },
            };

            const rootPost = {
                user_id: 'differentUser',
            };

            const isCommentMention = isPostCommentMention({currentUser, post, rootPost, threadRepliedToByCurrentUser: true});
            assert.equal(isCommentMention, true);
        });

        it('should return false as root post is not by currentUser and notify_props is root', () => {
            const post = {
                user_id: 'someotherUser',
            };

            const rootPost = {
                user_id: 'differentUser',
            };

            const modifiedCurrentUser = {
                ...currentUser,
                notify_props: {
                    comments: 'root',
                },
            };

            const isCommentMention = isPostCommentMention({currentUser: modifiedCurrentUser, post, rootPost, threadRepliedToByCurrentUser: true});
            assert.equal(isCommentMention, false);
        });

        it('should return true as root post is by currentUser and notify_props is root', () => {
            const post = {
                user_id: 'someotherUser',
            };

            const rootPost = {
                user_id: 'currentUser',
            };

            const modifiedCurrentUser = {
                ...currentUser,
                notify_props: {
                    comments: 'root',
                },
            };

            const isCommentMention = isPostCommentMention({currentUser: modifiedCurrentUser, post, rootPost, threadRepliedToByCurrentUser: true});
            assert.equal(isCommentMention, true);
        });
    });

    describe('isMeMessage', () => {
        it('should correctly identify messages generated from /me', () => {
            for (const data of [
                {
                    post: {type: 'hello'},
                    result: false,
                },
                {
                    post: {type: 'ME'},
                    result: false,
                },
                {
                    post: {type: PostTypes.ME},
                    result: true,
                },
            ]) {
                const confirmation = isMeMessage(data.post);
                assert.equal(confirmation, data.result, data.post);
            }
        });
    });

    describe('getEmbedFromMetadata', () => {
        it('should return null if no metadata is not passed as argument', () => {
            const embedData = getEmbedFromMetadata();
            assert.equal(embedData, null);
        });

        it('should return null if argument does not contain embed key', () => {
            const embedData = getEmbedFromMetadata({});
            assert.equal(embedData, null);
        });

        it('should return null if embed key in argument is empty', () => {
            const embedData = getEmbedFromMetadata({embeds: []});
            assert.equal(embedData, null);
        });

        it('should return first entry in embed key', () => {
            const embedValue = {type: 'opengraph', url: 'url'};
            const embedData = getEmbedFromMetadata({embeds: [embedValue, {type: 'image', url: 'url1'}]});
            assert.equal(embedData, embedValue);
        });
    });

    describe('shouldUpdatePost', () => {
        const storedPost = {
            id: 'post1',
            message: '123',
            update_at: 100,
            is_following: false,
            participants: null,
            reply_count: 4,
        };

        it('should return true for new posts', () => {
            const post = {
                ...storedPost,
                update_at: 100,
            };

            expect(shouldUpdatePost(post, null)).toBe(true);
        });

        it('should return false for older posts', () => {
            const post = {
                ...storedPost,
                update_at: 40,
            };

            expect(shouldUpdatePost(post, storedPost)).toBe(false);
        });

        it('should return true for newer posts', () => {
            const post = {
                id: 'post1',
                message: 'test',
                update_at: 400,
                is_following: false,
                participants: null,
                reply_count: 4,
            };
            expect(shouldUpdatePost(post, storedPost)).toBe(true);
        });

        it('should return false for same posts', () => {
            const post = {...storedPost};
            expect(shouldUpdatePost(post, storedPost)).toBe(false);
        });

        it('should return true for same posts with participants changed', () => {
            const post = {
                ...storedPost,
                participants: [],
            };
            expect(shouldUpdatePost(post, storedPost)).toBe(true);
        });

        it('should return true for same posts with reply_count changed', () => {
            const post = {
                ...storedPost,
                reply_count: 2,
            };
            expect(shouldUpdatePost(post, storedPost)).toBe(true);
        });

        it('should return true for same posts with is_following changed', () => {
            const post = {
                ...storedPost,
                is_following: true,
            };
            expect(shouldUpdatePost(post, storedPost)).toBe(true);
        });
    });
});
