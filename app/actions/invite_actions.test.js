// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import {sendMembersInvites, sendGuestsInvites} from 'actions/invite_actions.jsx';

jest.mock('actions/team_actions', () => ({
    addUsersToTeam: () => ({ // since we are using addUsersToTeamGracefully, this call will always succeed
        type: 'MOCK_RECEIVED_ME',
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    joinChannel: (userId, team, channel) => {
        if (channel === 'correct') {
            return ({type: 'MOCK_RECEIVED_ME'});
        }
        if (channel === 'correct2') {
            return ({type: 'MOCK_RECEIVED_ME'});
        }
        throw new Error('ERROR');
    },
}));

jest.mock('mattermost-redux/actions/teams', () => ({
    getTeamMembersByIds: () => ({type: 'MOCK_RECEIVED_ME'}),
    sendEmailInvitesToTeamGracefully: (team, emails) => {
        // Poor attempt to mock rate limiting.
        if (emails.length > 21) {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'Invite emails rate limit exceeded.'}}))});
        }
        return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: team === 'correct' ? undefined : {message: 'Unable to add the user to the team.'}}))});
    },
    sendEmailGuestInvitesToChannelsGracefully: (team, channels, emails) => {
        // Poor attempt to mock rate limiting.
        if (emails.length > 21) {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'Invite emails rate limit exceeded.'}}))});
        }
        return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: team === 'correct' ? undefined : {message: 'Unable to add the guest to the channels.'}}))});
    },
}));

describe('actions/invite_actions', () => {
    const mockStore = configureStore();
    const store = mockStore({
        entities: {
            general: {
                config: {
                    DefaultClientLocale: 'en',
                },
            },
            teams: {
                teams: {
                    correct: {id: 'correct'},
                    error: {id: 'error'},
                },
                membersInTeam: {
                    correct: {
                        user1: {id: 'user1'},
                        user2: {id: 'user2'},
                        guest1: {id: 'guest1'},
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                    error: {
                        user1: {id: 'user1'},
                        user2: {id: 'user2'},
                        guest1: {id: 'guest1'},
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                },
                myMembers: {},
            },
            channels: {
                myMembers: {},
                channels: {},
                membersInChannel: {
                    correct: {
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                    correct2: {
                        guest2: {id: 'guest2'},
                    },
                    error: {
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                },
            },
            users: {
                currentUserId: 'user1',
                profiles: {},
            },
        },
    });

    describe('sendMembersInvites', () => {
        it('should generate and empty list if nothing is passed', async () => {
            const response = await sendMembersInvites('correct', [], [])(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [],
                notSent: [],
            });
        });

        it('should generate list of success for emails', async () => {
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await sendMembersInvites('correct', [], emails)(store.dispatch, store.getState);
            expect(response).toEqual({
                notSent: [],
                sent: [
                    {
                        email: 'email-one@email-one.com',
                        reason: 'An invitation email has been sent.',
                    },
                    {
                        email: 'email-two@email-two.com',
                        reason: 'An invitation email has been sent.',
                    },
                    {
                        email: 'email-three@email-three.com',
                        reason: 'An invitation email has been sent.',
                    },
                ],
            });
        });

        it('should generate list of failures for emails on invite fails', async () => {
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await sendMembersInvites('error', [], emails)(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [],
                notSent: [
                    {
                        email: 'email-one@email-one.com',
                        reason: 'Unable to add the user to the team.',
                    },
                    {
                        email: 'email-two@email-two.com',
                        reason: 'Unable to add the user to the team.',
                    },
                    {
                        email: 'email-three@email-three.com',
                        reason: 'Unable to add the user to the team.',
                    },
                ],
            });
        });

        it('should generate list of failures and success for regular users and guests', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'guest1', roles: 'system_guest'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-guest', roles: 'system_guest'},
            ];
            const response = await sendMembersInvites('correct', users, [])(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [
                    {
                        reason: 'This member has been added to the team.',
                        user: {
                            id: 'other-user',
                            roles: 'system_user',
                        },
                    },
                ],
                notSent: [
                    {
                        reason: 'This person is already a team member.',
                        user: {
                            id: 'user1',
                            roles: 'system_user',
                        },
                    },
                    {
                        reason: 'Contact your admin to make this guest a full member.',
                        user: {
                            id: 'guest1',
                            roles: 'system_guest',
                        },
                    },
                    {
                        reason: 'Contact your admin to make this guest a full member.',
                        user: {
                            id: 'other-guest',
                            roles: 'system_guest',
                        },
                    },
                ],
            });
        });

        it('should generate a failure for problems adding a user', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'guest1', roles: 'system_guest'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-guest', roles: 'system_guest'},
            ];
            const response = await sendMembersInvites('error', users, [])(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [{user: {id: 'other-user', roles: 'system_user'}, reason: 'This member has been added to the team.'}],
                notSent: [
                    {
                        reason: 'This person is already a team member.',
                        user: {
                            id: 'user1',
                            roles: 'system_user',
                        },
                    },
                    {
                        reason: 'Contact your admin to make this guest a full member.',
                        user: {
                            id: 'guest1',
                            roles: 'system_guest',
                        },
                    },
                    {
                        reason: 'Contact your admin to make this guest a full member.',
                        user: {
                            id: 'other-guest',
                            roles: 'system_guest',
                        },
                    },
                ],
            });
        });

        it('should generate a failure for rate limits', async () => {
            const emails = [];
            const expectedNotSent = [];
            for (let i = 0; i < 22; i++) {
                emails.push('email-' + i + '@example.com');
                expectedNotSent.push({
                    email: 'email-' + i + '@example.com',
                    reason: 'Invite emails rate limit exceeded.',
                });
            }
            const response = await sendMembersInvites('correct', [], emails)(store.dispatch, store.getState);
            expect(response).toEqual({
                notSent: expectedNotSent,
                sent: [],
            });
        });
    });

    describe('sendGuestsInvites', () => {
        it('should generate and empty list if nothing is passed', async () => {
            const response = await sendGuestsInvites('correct', [], [], [], '')(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [],
                notSent: [],
            });
        });

        it('should generate list of success for emails', async () => {
            const channels = ['correct'];
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await sendGuestsInvites('correct', channels, [], emails, 'message')(store.dispatch, store.getState);
            expect(response).toEqual({
                notSent: [],
                sent: [
                    {
                        email: 'email-one@email-one.com',
                        reason: 'An invitation email has been sent.',
                    },
                    {
                        email: 'email-two@email-two.com',
                        reason: 'An invitation email has been sent.',
                    },
                    {
                        email: 'email-three@email-three.com',
                        reason: 'An invitation email has been sent.',
                    },
                ],
            });
        });

        it('should generate list of failures for emails on invite fails', async () => {
            const channels = ['correct'];
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await sendGuestsInvites('error', channels, [], emails, 'message')(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [],
                notSent: [
                    {
                        email: 'email-one@email-one.com',
                        reason: 'Unable to add the guest to the channels.',
                    },
                    {
                        email: 'email-two@email-two.com',
                        reason: 'Unable to add the guest to the channels.',
                    },
                    {
                        email: 'email-three@email-three.com',
                        reason: 'Unable to add the guest to the channels.',
                    },
                ],
            });
        });

        it('should generate list of failures and success for regular users and guests', async () => {
            const channels = ['correct'];
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'guest1', roles: 'system_guest'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-guest', roles: 'system_guest'},
            ];
            const response = await sendGuestsInvites('correct', channels, users, [], 'message')(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [
                    {
                        reason: {
                            id: 'invite.guests.new-member',
                            message: 'This guest has been added to the team and {count, plural, one {channel} other {channels}}.',
                            values: {count: channels.length},
                        },
                        user: {
                            id: 'guest1',
                            roles: 'system_guest',
                        },
                    },
                    {
                        reason: {
                            id: 'invite.guests.new-member',
                            message: 'This guest has been added to the team and {count, plural, one {channel} other {channels}}.',
                            values: {count: channels.length},
                        },
                        user: {
                            id: 'other-guest',
                            roles: 'system_guest',
                        },
                    },
                ],
                notSent: [
                    {
                        reason: 'This person is already a member.',
                        user: {
                            id: 'user1',
                            roles: 'system_user',
                        },
                    },
                    {
                        reason: 'This person is already a member.',
                        user: {
                            id: 'other-user',
                            roles: 'system_user',
                        },
                    },
                ],
            });
        });

        it('should generate a failure for users that are part of all or some of the channels', async () => {
            const users = [
                {id: 'guest2', roles: 'system_guest'},
                {id: 'guest3', roles: 'system_guest'},
            ];
            const response = await sendGuestsInvites('correct', ['correct', 'correct2'], users, [], 'message')(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [],
                notSent: [
                    {
                        reason: 'This person is already a member of all the channels.',
                        user: {
                            id: 'guest2',
                            roles: 'system_guest',
                        },
                    },
                    {
                        reason: 'This person is already a member of some of the channels.',
                        user: {
                            id: 'guest3',
                            roles: 'system_guest',
                        },
                    },
                ],
            });
        });

        it('should generate a failure for problems adding a user to team', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'guest1', roles: 'system_guest'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-guest', roles: 'system_guest'},
            ];
            const response = await sendGuestsInvites('error', ['correct'], users, [], 'message')(store.dispatch, store.getState);

            expect(response).toEqual({
                sent: [
                    {
                        user: {
                            id: 'guest1',
                            roles: 'system_guest',
                        },
                        reason: {
                            id: 'invite.guests.new-member',
                            message: 'This guest has been added to the team and {count, plural, one {channel} other {channels}}.',
                            values: {
                                count: 1,
                            },
                        },
                    },
                    {
                        user: {
                            id: 'other-guest',
                            roles: 'system_guest',
                        },
                        reason: {
                            id: 'invite.guests.new-member',
                            message: 'This guest has been added to the team and {count, plural, one {channel} other {channels}}.',
                            values: {
                                count: 1,
                            },
                        },
                    },
                ],
                notSent: [
                    {
                        reason: 'This person is already a member.',
                        user: {
                            id: 'user1',
                            roles: 'system_user',
                        },
                    },
                    {
                        reason: 'This person is already a member.',
                        user: {
                            id: 'other-user',
                            roles: 'system_user',
                        },
                    },
                ],
            });
        });

        it('should generate a failure for problems adding a user to channels', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'guest1', roles: 'system_guest'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-guest', roles: 'system_guest'},
            ];
            const response = await sendGuestsInvites('correct', ['error'], users, [], 'message')(store.dispatch, store.getState);
            expect(response).toEqual({
                sent: [],
                notSent: [
                    {
                        reason: 'This person is already a member.',
                        user: {
                            id: 'user1',
                            roles: 'system_user',
                        },
                    },
                    {
                        reason: 'Unable to add the guest to the channels.',
                        user: {
                            id: 'guest1',
                            roles: 'system_guest',
                        },
                    },
                    {
                        reason: 'This person is already a member.',
                        user: {
                            id: 'other-user',
                            roles: 'system_user',
                        },
                    },
                    {
                        reason: 'Unable to add the guest to the channels.',
                        user: {
                            id: 'other-guest',
                            roles: 'system_guest',
                        },
                    },
                ],
            });
        });

        it('should generate a failure for rate limits', async () => {
            const emails = [];
            const expectedNotSent = [];
            for (let i = 0; i < 22; i++) {
                emails.push('email-' + i + '@example.com');
                expectedNotSent.push({
                    email: 'email-' + i + '@example.com',
                    reason: 'Invite emails rate limit exceeded.',
                });
            }

            const response = await sendGuestsInvites('correct', ['correct'], [], emails, 'message')(store.dispatch, store.getState);
            expect(response).toEqual({
                notSent: expectedNotSent,
                sent: [],
            });
        });
    });
});
