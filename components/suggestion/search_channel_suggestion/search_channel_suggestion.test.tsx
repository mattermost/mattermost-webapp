// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import SearchChannelSuggestion from './search_channel_suggestion';

describe('components/suggestion/search_channel_suggestion', () => {
    const mockChannel = TestHelper.getChannelMock();
    const mockTeamMate = TestHelper.getUserMock();

    // No overload matches this call.
    // Overload 1 of 2, '(props: Readonly<SearchChannelSuggestionProps>): SearchChannelSuggestion', gave the following error.

    // Type '{ teammate: UserProfile | undefined; currentUser: string; term: string; matchedPretext: string; isSelection?: boolean | undefined; onClick?: ((term: string, matchedPretext: string) => void) | undefined; onMouseMove?: ((term: string) => void) | undefined; item: Channel; }' is not assignable to type 'Readonly<SearchChannelSuggestionProps>'.
    // Property 'teammate' is incompatible with index signature.
    // Type 'UserProfile | undefined' is not assignable to type 'never'.
    // Type 'undefined' is not assignable to type 'never'.

    const baseProps = {
        item: mockChannel || undefined,
        isSelection: false,
        teammate: mockTeamMate,
        currentUser: 'userid1',
        term: '',
        matchedPretext: '',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SearchChannelSuggestion {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, isSelection is false', () => {
        const props = {...baseProps, isSelection: false};
        const wrapper = shallow(
            <SearchChannelSuggestion {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, isSelection is true', () => {
        const props = {...baseProps, isSelection: true};
        const wrapper = shallow(
            <SearchChannelSuggestion {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel type DM_CHANNEL', () => {
        mockChannel.type = 'D';
        const props = {...baseProps, item: mockChannel, isSelection: true};
        const wrapper = shallow(
            <SearchChannelSuggestion {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel type GM_CHANNEL', () => {
        mockChannel.type = 'G';
        const props = {...baseProps, item: mockChannel, isSelection: true};
        const wrapper = shallow(
            <SearchChannelSuggestion {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel type OPEN_CHANNEL', () => {
        mockChannel.type = 'O';
        const props = {...baseProps, item: mockChannel, isSelection: true};
        const wrapper = shallow(
            <SearchChannelSuggestion {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel type PRIVATE_CHANNEL', () => {
        mockChannel.type = 'P';
        const props = {...baseProps, item: mockChannel, isSelection: true};
        const wrapper = shallow(
            <SearchChannelSuggestion {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
