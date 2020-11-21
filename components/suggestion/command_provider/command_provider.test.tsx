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
            const provider = new CommandProvider({isInRHS: false}, store);
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
            const provider = new CommandProvider({isInRHS: false}, store);

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
