// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug/mobile_channel_header_plug.jsx';

describe('plugins/MobileChannelHeaderPlug', () => {
    const testPlug = {
        id: 'someid',
        pluginId: 'pluginid',
        icon: <i className='fa fa-anchor'/>,
        action: jest.fn,
        dropdownText: 'some dropdown text',
    };

    test('should match snapshot with no extended component', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one extended component', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a single list item containing a button
        expect(wrapper.find('li')).toHaveLength(1);
        expect(wrapper.find('button')).toHaveLength(1);

        wrapper.instance().fireAction = jest.fn();
        wrapper.find('button').first().simulate('click');
        expect(wrapper.instance().fireAction).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().fireAction).toBeCalledWith(testPlug);
    });

    test('should match snapshot with two extended components', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with no extended component, in dropdown', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one extended component, in dropdown', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a single list item containing an anchor
        expect(wrapper.find('li')).toHaveLength(1);
        expect(wrapper.find('a')).toHaveLength(1);
    });

    test('should match snapshot with two extended components, in dropdown', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a two list items containing anchors
        expect(wrapper.find('li')).toHaveLength(2);
        expect(wrapper.find('a')).toHaveLength(2);

        const instance = wrapper.instance();
        instance.fireAction = jest.fn();

        wrapper.find('a').first().simulate('click');
        expect(instance.fireAction).toHaveBeenCalledTimes(1);
        expect(instance.fireAction).toBeCalledWith(testPlug);
    });

    test('should call plugin.action on fireAction', () => {
        const channel = {id: 'channel_id'};
        const channelMember = {id: 'channel_member_id'};
        const newTestPlug = {
            id: 'someid',
            pluginId: 'pluginid',
            icon: <i className='fa fa-anchor'/>,
            action: jest.fn(),
            dropdownText: 'some dropdown text',
        };

        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[newTestPlug]}
                channel={channel}
                channelMember={channelMember}
                theme={{}}
                isDropdown={true}
            />,
        );

        wrapper.instance().fireAction(newTestPlug);
        expect(newTestPlug.action).toHaveBeenCalledTimes(1);
        expect(newTestPlug.action).toBeCalledWith(channel, channelMember);
    });
});
