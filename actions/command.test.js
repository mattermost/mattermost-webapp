// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {Client4} from 'mattermost-redux/client';

import * as Channels from 'mattermost-redux/selectors/entities/channels';
import * as Teams from 'mattermost-redux/selectors/entities/teams';

import {ActionTypes, Constants} from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import UserSettingsModal from 'components/user_settings/modal';

import {executeCommand} from './command';
const mockStore = configureStore([thunk]);

const currentChannelId = '123';
const currentTeamId = '321';
const currentUserId = 'user123';
const initialState = {
    entities: {
        general: {
            config: {
                ExperimentalViewArchivedChannels: 'false',
            },
        },
        channels: {
            currentChannelId,
        },
        preferences: {
            myPreferences: {},
        },
        teams: {
            currentTeamId,
        },
        users: {
            currentUserId,
            profiles: {
                user123: {
                    timezone: {
                        useAutomaticTimezone: true,
                        automaticTimezone: '',
                        manualTimezone: '',
                    },
                },
            },
        },
    },
    views: {
        rhs: {
            rhsState: null,
            searchTerms: '',
        },
    },
};

jest.mock('utils/user_agent');
jest.mock('actions/global_actions.jsx');

describe('executeCommand', () => {
    let store;
    beforeEach(async () => {
        store = await mockStore(initialState);
    });

    describe('search', () => {
        test('should fire the UPDATE_RHS_SEARCH_TERMS with the terms', async () => {
            store.dispatch(executeCommand('/search foo bar', []));

            expect(store.getActions()).toEqual([
                {type: 'UPDATE_RHS_SEARCH_TERMS', terms: 'foo bar'},
                {type: 'UPDATE_RHS_STATE', state: 'search'},
                {type: 'UPDATE_RHS_SEARCH_RESULTS_TERMS', terms: ''},
                {type: 'SEARCH_POSTS_REQUEST', isGettingMore: false},
            ]);
        });
    });

    describe('shortcuts', () => {
        UserAgent.isMobile = jest.fn();

        test('should return error in case of mobile', async () => {
            UserAgent.isMobile.mockReturnValueOnce(true);

            const result = await store.dispatch(executeCommand('/shortcuts', []));

            expect(result).toEqual({
                error: {
                    message: 'Keyboard shortcuts are not supported on your device',
                },
            });
        });

        test('should call toggleShortcutsModal in case of no mobile', async () => {
            UserAgent.isMobile.mockReturnValueOnce(false);

            const result = await store.dispatch(executeCommand('/shortcuts', []));

            expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
            expect(result).toEqual({data: true});
        });
    });

    describe('settings', () => {
        test('should pass right modal params', async () => {
            const result = await store.dispatch(executeCommand('/settings', {}));
            expect(store.getActions()).toEqual([
                {
                    type: ActionTypes.MODAL_OPEN,
                    dialogType: UserSettingsModal,
                    modalId: 'user_settings',
                },
            ]);
            expect(result).toEqual({data: true});
        });
    });

    describe('collapse', () => {
        test('call executeCommand with right params', async () => {
            Client4.executeCommand = jest.fn().mockResolvedValue({});
            await store.dispatch(executeCommand('/collapse', []));
            expect(Client4.executeCommand).toHaveBeenCalledWith('/collapse ', []);
        });
    });

    describe('leave', () => {
        test('should send message when command typed in reply threads', async () => {
            GlobalActions.sendEphemeralPost = jest.fn();

            const result = await store.dispatch(executeCommand('/leave', {channel_id: 'channel_id', parent_id: 'parent_id'}));

            expect(GlobalActions.sendEphemeralPost).
                toHaveBeenCalledWith('/leave is not supported in reply threads. Use it in the center channel instead.',
                    'channel_id', 'parent_id');

            expect(result).toEqual({data: true});
        });

        test('should show private modal if channel is private', async () => {
            GlobalActions.showLeavePrivateChannelModal = jest.fn();
            Channels.getCurrentChannel = jest.fn(() => ({type: Constants.PRIVATE_CHANNEL}));

            const result = await store.dispatch(executeCommand('/leave', {}));

            expect(GlobalActions.showLeavePrivateChannelModal).toHaveBeenCalledWith({type: Constants.PRIVATE_CHANNEL});

            expect(result).toEqual({data: true});
        });

        test('should use user id as name if channel is dm', async () => {
            Utils.getUserIdFromChannelName = jest.fn(() => 'userId');
            Channels.getRedirectChannelNameForTeam = jest.fn(() => 'channel1');
            Teams.getCurrentRelativeTeamUrl = jest.fn(() => '/team1');
            Channels.getCurrentChannel = jest.fn(() => ({type: Constants.DM_CHANNEL}));

            const result = await store.dispatch(executeCommand('/leave', {}));
            expect(store.getActions()[0].data).toEqual([{category: 'direct_channel_show', name: 'userId', user_id: 'user123', value: 'false'}]);

            expect(result).toEqual({data: true});
        });

        test('should use channel id as name if channel is gm', async () => {
            Utils.getUserIdFromChannelName = jest.fn(() => 'userId');
            Channels.getRedirectChannelNameForTeam = jest.fn(() => 'channel1');
            Teams.getCurrentRelativeTeamUrl = jest.fn(() => '/team1');
            Channels.getCurrentChannel = jest.fn(() => ({type: Constants.GM_CHANNEL, id: 'channelId'}));

            const result = await store.dispatch(executeCommand('/leave', {}));
            expect(store.getActions()[0].data).toEqual([{category: 'group_channel_show', name: 'channelId', user_id: 'user123', value: 'false'}]);

            expect(result).toEqual({data: true});
        });
    });
});
