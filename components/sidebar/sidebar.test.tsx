// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Sidebar from 'components/sidebar/sidebar';

describe('components/sidebar', () => {
    const baseProps = {
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        canJoinPublicChannel: true,
        isDataPrefechEnabled: true,
        isOpen: false,
        teamId: 'fake_team_id',
        hasSeenModal: true,
        isCloud: false,
        actions: {
            createCategory: jest.fn(),
            fetchMyCategories: jest.fn(),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when isDataPrefechEnabled is disabled', () => {
        const wrapper = shallow(
            <Sidebar {...{...baseProps, isDataPrefechEnabled: false}}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when direct channels modal is open', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>,
        );

        wrapper.instance().setState({showDirectChannelsModal: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when more channels modal is open', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>,
        );

        wrapper.instance().setState({showMoreChannelsModal: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should toggle direct messages modal correctly', () => {
        const wrapper = shallow<Sidebar>(
            <Sidebar {...baseProps}/>,
        );
        const instance = wrapper.instance();
        const mockEvent: Partial<Event> = {preventDefault: jest.fn()};

        instance.hideMoreDirectChannelsModal = jest.fn();
        instance.showMoreDirectChannelsModal = jest.fn();

        instance.handleOpenMoreDirectChannelsModal(mockEvent as any);
        expect(instance.showMoreDirectChannelsModal).toHaveBeenCalled();

        instance.setState({showDirectChannelsModal: true});
        instance.handleOpenMoreDirectChannelsModal(mockEvent as any);
        expect(instance.hideMoreDirectChannelsModal).toHaveBeenCalled();
    });

    test('should match empty div snapshot when teamId is missing', () => {
        const props = {
            ...baseProps,
            teamId: '',
        };
        const wrapper = shallow(
            <Sidebar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
