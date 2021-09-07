// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {Client4} from 'mattermost-redux/client';

import * as Channels from 'mattermost-redux/selectors/entities/channels';
import * as Teams from 'mattermost-redux/selectors/entities/teams';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {ActionTypes, Constants} from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as GlobalActions from 'actions/global_actions';
import * as Utils from 'utils/utils.jsx';
import UserSettingsModal from 'components/user_settings/modal';

import {executeCommand} from './command';
const mockStore = configureStore([thunk]);

const currentChannelId = '123';
const currentTeamId = '321';
const currentUserId = 'user123';
const initialState = {
    entities: {
        admin: {
            pluginStatuses: {
                'com.mattermost.apps': {
                    state: 2,
                },
            },
        },
        general: {
            config: {
                ExperimentalViewArchivedChannels: 'false',
            },
        },
        posts: {
            posts: {
                root_id: {id: 'root_id', channel_id: '123'},
            },
        },
        channels: {
            currentChannelId,
            channels: {
                123: {id: '123', team_id: '456'},
            },
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
        apps: {
            main: {
                bindings: [
                    {
                        location: '/command',
                        bindings: [
                            {
                                location: '/command/appid',
                                app_id: 'appid',
                                label: 'appid',
                                bindings: [
                                    {
                                        location: '/command/appid/custom',
                                        app_id: 'appid',
                                        label: 'custom',
                                        description: 'Run the command.',
                                        call: {
                                            path: 'https://someserver.com/command',
                                        },
                                        form: {
                                            fields: [
                                                {
                                                    name: 'key1',
                                                    label: 'key1',
                                                    type: 'text',
                                                    position: 1,
                                                },
                                                {
                                                    name: 'key2',
                                                    label: 'key2',
                                                    type: 'static_select',
                                                    options: [
                                                        {
                                                            label: 'Value 2',
                                                            value: 'value2',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
                forms: {},
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
jest.mock('actions/global_actions');

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
                {type: 'SEARCH_FILES_REQUEST', isGettingMore: false},
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
                    dialogProps: {isContentProductSettings: true},
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
            GlobalActions.sendEphemeralPost = jest.fn().mockReturnValue({type: 'someaction'});

            const result = await store.dispatch(executeCommand('/leave', {channel_id: 'channel_id', root_id: 'root_id'}));

            expect(GlobalActions.sendEphemeralPost).
                toHaveBeenCalledWith('/leave is not supported in reply threads. Use it in the center channel instead.',
                    'channel_id', 'root_id');

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

    describe('app command', () => {
        test('should call executeAppCall', async () => {
            const state = {
                ...initialState,
                entities: {
                    ...initialState.entities,
                    general: {
                        ...initialState.entities.general,
                        config: {
                            ...initialState.entities.general.config,
                            FeatureFlagAppsEnabled: 'true',
                        },
                    },
                },
            };
            store = await mockStore(state);
            const f = Client4.executeAppCall;
            const mocked = jest.fn().mockResolvedValue(Promise.resolve({
                type: AppCallResponseTypes.OK,
                markdown: 'Success',
            }));
            Client4.executeAppCall = mocked;

            const result = await store.dispatch(executeCommand('/appid custom value1 --key2 value2', {channel_id: '123'}));
            Client4.executeAppCall = f;

            expect(mocked).toHaveBeenCalledWith({
                context: {
                    app_id: 'appid',
                    channel_id: '123',
                    location: '/command/appid/custom',
                    root_id: '',
                    team_id: '456',
                },
                raw_command: '/appid custom value1 --key2 value2',
                path: 'https://someserver.com/command',
                values: {
                    key1: 'value1',
                    key2: {label: 'Value 2', value: 'value2'},
                },
                expand: {},
                query: undefined,
                selected_field: undefined,
            }, 'submit');
            expect(result).toEqual({data: true});
        });
    });
});
