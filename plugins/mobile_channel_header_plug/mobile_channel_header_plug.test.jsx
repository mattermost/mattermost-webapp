// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug/mobile_channel_header_plug';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {createCallContext, createCallRequest} from 'utils/apps';
import {AppCallResponseTypes, AppCallTypes} from 'mattermost-redux/constants/apps';

describe('plugins/MobileChannelHeaderPlug', () => {
    const testPlug = {
        id: 'someid',
        pluginId: 'pluginid',
        icon: <i className='fa fa-anchor'/>,
        action: jest.fn(),
        dropdownText: 'some dropdown text',
    };

    const testBinding = {
        app_id: 'appid',
        location: 'test',
        icon: 'http://test.com/icon.png',
        label: 'Label',
        hint: 'Hint',
        call: {
            path: '/call/path',
        },
    };

    test('should match snapshot with no extended component', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one extended component', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
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
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with no bindings', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={true}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one binding', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={true}
                appBindings={[testBinding]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a single list item containing a button
        expect(wrapper.find('li')).toHaveLength(1);
        expect(wrapper.find('button')).toHaveLength(1);

        wrapper.instance().fireAppAction = jest.fn();
        wrapper.find('button').first().simulate('click');
        expect(wrapper.instance().fireAppAction).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().fireAppAction).toBeCalledWith(testBinding);
    });

    test('should match snapshot with two bindings', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={false}
                appBindings={[testBinding, {...testBinding, app_id: 'app2'}]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one extended components and one binding', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
                appsEnabled={true}
                appBindings={[testBinding]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with no extended component, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one extended component, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a single list item containing an anchor
        expect(wrapper.find('li')).toHaveLength(1);
        expect(wrapper.find('a')).toHaveLength(1);
    });

    test('should match snapshot with two extended components, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
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

    test('should match snapshot with no binding, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={true}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render nothing
        expect(wrapper.find('li').exists()).toBe(false);
    });

    test('should match snapshot with one binding, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={true}
                appBindings={[testBinding]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a single list item containing an anchor
        expect(wrapper.find('li')).toHaveLength(1);
        expect(wrapper.find('a')).toHaveLength(1);
    });

    test('should match snapshot with two bindings, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={true}
                appBindings={[testBinding, {...testBinding, app_id: 'app2'}]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a two list items containing anchors
        expect(wrapper.find('li')).toHaveLength(2);
        expect(wrapper.find('a')).toHaveLength(2);

        const instance = wrapper.instance();
        instance.fireAppAction = jest.fn();

        wrapper.find('a').first().simulate('click');
        expect(instance.fireAppAction).toHaveBeenCalledTimes(1);
        expect(instance.fireAppAction).toBeCalledWith(testBinding);
    });

    test('should match snapshot with one extended component and one binding, in dropdown', () => {
        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
                appsEnabled={true}
                appBindings={[testBinding]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        // Render a two list items containing anchors
        expect(wrapper.find('li')).toHaveLength(2);
        expect(wrapper.find('a')).toHaveLength(2);
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

        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[newTestPlug]}
                channel={channel}
                channelMember={channelMember}
                theme={{}}
                isDropdown={true}
                appsEnabled={false}
                appBindings={[]}
                actions={{
                    doAppSubmit: jest.fn(),
                    openAppsModal: jest.fn(),
                }}
            />,
        );

        wrapper.instance().fireAction(newTestPlug);
        expect(newTestPlug.action).toHaveBeenCalledTimes(1);
        expect(newTestPlug.action).toBeCalledWith(channel, channelMember);
    });

    test('should call doAppSubmit on fireAppAction', () => {
        const channel = {id: 'channel_id'};
        const channelMember = {id: 'channel_member_id'};

        const doAppSubmit = jest.fn().mockResolvedValue({data: {type: AppCallResponseTypes.OK}});

        const wrapper = mountWithIntl(
            <MobileChannelHeaderPlug
                components={[]}
                channel={channel}
                channelMember={channelMember}
                theme={{}}
                isDropdown={true}
                appsEnabled={true}
                appBindings={[testBinding]}
                actions={{
                    doAppSubmit,
                    openAppsModal: jest.fn(),
                }}
            />,
        );

        const context = createCallContext(
            testBinding.app_id,
            testBinding.location,
            channel.id,
            channel.team_id,
        );
        const call = createCallRequest(testBinding.call, context);

        wrapper.instance().fireAppAction(testBinding);
        expect(doAppSubmit).toHaveBeenCalledTimes(1);
        expect(doAppSubmit).toBeCalledWith(call, AppCallTypes.SUBMIT, expect.anything());
    });
});
