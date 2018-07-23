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
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with one extended component', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with two extended components', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with no extended component, in dropdown', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with one extended component, in dropdown', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with two extended components, in dropdown', () => {
        const wrapper = mount(
            <MobileChannelHeaderPlug
                components={[testPlug, {...testPlug, id: 'someid2'}]}
                channel={{}}
                channelMember={{}}
                theme={{}}
                isDropdown={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
