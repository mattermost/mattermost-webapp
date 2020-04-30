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
        isOpen: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when direct channels modal is open', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>
        );

        wrapper.instance().setState({showDirectChannelsModal: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when more channels modal is open', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>
        );

        wrapper.instance().setState({showMoreChannelsModal: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should toggle direct messages modal correctly', () => {
        const wrapper = shallow<Sidebar>(
            <Sidebar {...baseProps}/>
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
});
