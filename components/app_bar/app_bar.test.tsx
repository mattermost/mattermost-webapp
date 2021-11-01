// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from 'mattermost-redux/types/channels';
import {Theme} from 'mattermost-redux/types/themes';

import {PluginComponent} from 'types/store/plugins';

import AppBar, {Props} from './app_bar';

describe('components/app_bar/app_bar', () => {
    const channelHeaderIcon = <img id='the_icon'/>;

    const channelHeaderComponents: PluginComponent[] = [
        {
            id: 'the_component_id',
            pluginId: 'playbooks',
            icon: channelHeaderIcon,
            action: jest.fn(),
        },
    ];

    const baseProps: Props = {
        activePluginId: 'playbooks',
        appBarBindings: [],
        channelHeaderComponents,
        channel: {} as Channel,
        theme: {} as Theme,
        show: true,
    };

    test('should match snapshot on mount', async () => {
        const props = {
            ...baseProps,
        };

        const wrapper = shallow<AppBar>(
            <AppBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show provided icon for each channel header component', async () => {
        const props = {
            ...baseProps,
        };

        const wrapper = shallow<AppBar>(
            <AppBar {...props}/>,
        );

        expect(wrapper.find(channelHeaderIcon).exists()).toBe(false);
    });
});
