// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import ChannelHeaderPlug from 'plugins/channel_header_plug/channel_header_plug.jsx';
import {mountWithIntl} from '../../tests/helpers/intl-test-helper';

describe('plugins/ChannelHeaderPlug', () => {
    const testPlug = {
        id: 'someid',
        pluginId: 'pluginid',
        icon: <i className='fa fa-anchor'/>,
        action: jest.fn,
        dropdownText: 'some dropdown text',
        tooltipText: 'some tooltip text',
    };

    test('should match snapshot with no extended component', () => {
        const wrapper = mount(
            <ChannelHeaderPlug
                components={[]}
                channel={{}}
                channelMember={{}}
                theme={{}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with one extended component', () => {
        const wrapper = mount(
            <ChannelHeaderPlug
                components={[testPlug]}
                channel={{}}
                channelMember={{}}
                theme={{}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with six extended components', () => {
        const wrapper = mountWithIntl(
            <ChannelHeaderPlug
                components={[
                    testPlug,
                    {...testPlug, id: 'someid2'},
                    {...testPlug, id: 'someid3'},
                    {...testPlug, id: 'someid4'},
                    {...testPlug, id: 'someid5'},
                    {...testPlug, id: 'someid6'},
                ]}
                channel={{}}
                channelMember={{}}
                theme={{}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
