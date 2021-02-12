// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Client4} from 'mattermost-redux/client';

import CommandProvider, {CommandSuggestion, Results} from './command_provider';

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

            const provider = new CommandProvider({isInRHS: false});

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
