// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CommandProvider, {CommandSuggestion} from './command_provider';

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
    test('no active channel', () => {
        const provider = new CommandProvider({});
        const resultCallback = jest.fn();

        expect(provider.handlePretextChanged('/test', resultCallback)).toEqual(true);
    });
});
