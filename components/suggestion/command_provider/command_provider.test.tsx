// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Client4} from 'mattermost-redux/client';
import {AppBinding} from 'mattermost-redux/types/apps';

import globalStore from 'stores/redux_store';

import CommandProvider, {CommandSuggestion, Results} from './command_provider';
import {reduxTestState} from './test_data';

const mockStore = configureStore([thunk]);

const reduxTestState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 1,
                    msg_count: 9,
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    name: 'default-name',
                    display_name: 'Default',
                    delete_at: 0,
                    type: 'O',
                    total_msg_count: 10,
                    team_id: 'team_id',
                },
                current_user_id__existingId: {
                    id: 'current_user_id__existingId',
                    name: 'current_user_id__existingId',
                    display_name: 'Default',
                    delete_at: 0,
                    type: '0',
                    total_msg_count: 0,
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
            },
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {
                'team-id': {
                    id: 'team_id',
                    name: 'team-1',
                    displayName: 'Team 1',
                },
            },
            myMembers: {
                'team-id': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_role'},
            },
        },
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
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
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
    },
};

describe('CommandSuggestion', () => {
    const baseProps = {
        item: {
            suggestion: '/invite',
            hint: '@[username] ~[channel]',
            description: 'Invite a user to a channel',
            iconData: '',
        },
        isSelection: true,
        term: '/',
        matchedPretext: '',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <CommandSuggestion {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.slash-command__title').first().text()).toEqual('invite @[username] ~[channel]');
        expect(wrapper.find('.slash-command__desc').first().text()).toEqual('Invite a user to a channel');
    });
});

describe('CommandProvider', () => {
    const makeStore = async (bindings: AppBinding[]) => {
        const initialState = {
            ...reduxTestState,
            entities: {
                ...reduxTestState.entities,
                apps: {bindings},
            },
        } as any;
        const testStore = await mockStore(initialState);

        return testStore;
    };

    describe('constructor', () => {
        test('should set passed in store', async () => {
            const store = await makeStore([]);
            const provider = new CommandProvider({isInRHS: false}, store as any);
            expect(provider.store).toBe(store);
        });

        test('should set store to default if not provided', () => {
            const props = {isInRHS: false};
            const provider = new CommandProvider(props);
            expect(provider.store).toBe(globalStore);
        });

        test('should set store to default if wrong type is provided', () => {
            const props = {isInRHS: true};
            let provider = new CommandProvider(props, {dispatch: () => {}} as any);
            expect(provider.store).toBe(globalStore);

            provider = new CommandProvider(props, {getState: () => {}} as any);
            expect(provider.store).toBe(globalStore);
        });
    });

    describe('handlePretextChanged', () => {
        test('should fetch results from the server', async () => {
            const f = Client4.getCommandAutocompleteSuggestionsList;

            const mockFunc = jest.fn().mockResolvedValue([{
                Suggestion: 'issue',
                Complete: 'jira issue',
                Hint: 'hint',
                IconData: 'icon_data',
                Description: 'description',
            }]);
            Client4.getCommandAutocompleteSuggestionsList = mockFunc;

            const store = await makeStore([]);
            const provider = new CommandProvider({isInRHS: false}, store as any);

            const callback = jest.fn();
            provider.handlePretextChanged('/jira issue', callback);
            await mockFunc();

            const expected: Results = {
                matchedPretext: '/jira issue',
                terms: ['/jira issue'],
                items: [{
                    complete: '/jira issue',
                    suggestion: '/issue',
                    hint: 'hint',
                    iconData: 'icon_data',
                    description: 'description',
                }],
                component: CommandSuggestion,
            };
            expect(callback).toHaveBeenCalledWith(expected);

            Client4.getCommandAutocompleteSuggestionsList = f;
        });
    });
});
