// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {Theme} from 'mattermost-redux/types/preferences';

import ChannelHeaderPlug from 'plugins/channel_header_plug/channel_header_plug';
import {mountWithIntl} from '../../tests/helpers/intl-test-helper';
import {PluginComponent} from 'types/store/plugins';

describe('plugins/ChannelHeaderPlug', () => {
    const testPlug: PluginComponent = {
        id: 'someid',
        pluginId: 'pluginid',
        icon: <i className='fa fa-anchor'/>,
        action: jest.fn,
        dropdownText: 'some dropdown text',
        tooltipText: 'some tooltip text',
    } as PluginComponent;

    test('should match snapshot with no extended component', () => {
        const wrapper = mountWithIntl(
            <ChannelHeaderPlug
                components={[]}
                channel={{} as Channel}
                channelMember={{} as ChannelMembership}
                theme={{} as Theme}
                actions={{
                    doAppCall: jest.fn(),
                    postEphemeralCallResponseForChannel: jest.fn(),
                }}
                appBindings={[]}
                appsEnabled={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with one extended component', () => {
        const wrapper = mountWithIntl(
            <ChannelHeaderPlug
                components={[testPlug]}
                channel={{} as Channel}
                channelMember={{} as ChannelMembership}
                theme={{} as Theme}
                actions={{
                    doAppCall: jest.fn(),
                    postEphemeralCallResponseForChannel: jest.fn(),
                }}
                appBindings={[]}
                appsEnabled={false}
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
                    {...testPlug, id: 'someid7'},
                    {...testPlug, id: 'someid8'},
                    {...testPlug, id: 'someid9'},
                    {...testPlug, id: 'someid10'},
                    {...testPlug, id: 'someid11'},
                    {...testPlug, id: 'someid12'},
                    {...testPlug, id: 'someid13'},
                    {...testPlug, id: 'someid14'},
                    {...testPlug, id: 'someid15'},
                ]}
                channel={{} as Channel}
                channelMember={{} as ChannelMembership}
                theme={{} as Theme}
                actions={{
                    doAppCall: jest.fn(),
                    postEphemeralCallResponseForChannel: jest.fn(),
                }}
                appBindings={[]}
                appsEnabled={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
