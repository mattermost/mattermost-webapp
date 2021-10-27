// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from 'mattermost-redux/types/channels';
import {MarketplacePlugin, MarketplaceApp} from 'mattermost-redux/types/marketplace';
import {Theme} from 'mattermost-redux/types/themes';

import {PluginComponent} from 'types/store/plugins';

import AppBar, {Props} from './app_bar';

describe('components/app_bar/app_bar', () => {
    const marketplaceListing: Array<MarketplacePlugin | MarketplaceApp> = [
        {
            icon_data: 'the_icon_data',
            manifest: {
                id: 'playbooks',
                version: '1.0.0',
            },
        } as MarketplacePlugin,
    ];

    const channelHeaderComponents: PluginComponent[] = [
        {
            id: 'the_component_id',
            pluginId: 'playbooks',
            icon: 'fallback_component' as any,
            action: jest.fn(),
        },
    ];

    const baseProps: Props = {
        activePluginId: 'playbooks',
        appBarBindings: [],
        channelHeaderComponents,
        marketplaceListing,
        channel: {} as Channel,
        actions: {
            fetchListing: jest.fn().mockResolvedValue({data: []}),
        },
        theme: {} as Theme,
    };

    test('should match snapshot on mount', async () => {
        const props = {
            ...baseProps,
            actions: {
                fetchListing: jest.fn().mockResolvedValue({data: []}),
            },
        };

        const wrapper = shallow<AppBar>(
            <AppBar {...props}/>,
        );

        expect(props.actions.fetchListing).toHaveBeenCalled();
        expect(wrapper.state().loadedMarketplaceListing).toBe(false);
        expect(wrapper).toMatchSnapshot();

        await props.actions.fetchListing();
        expect(wrapper.state().loadedMarketplaceListing).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });

    test('should show icon from plugin marketplace', async () => {
        const props = {
            ...baseProps,
            actions: {
                fetchListing: jest.fn().mockResolvedValue({data: []}),
            },
        };

        const wrapper = shallow<AppBar>(
            <AppBar {...props}/>,
        );

        await props.actions.fetchListing();

        expect(wrapper.find('img[src="the_icon_data"]').exists()).toBe(true);
    });

    test('should show fallback icon when marketplace entry is missing', async () => {
        const props = {
            ...baseProps,
            actions: {
                fetchListing: jest.fn().mockResolvedValue({data: []}),
            },
            marketplaceListing: [],
        };

        const wrapper = shallow<AppBar>(
            <AppBar {...props}/>,
        );

        await props.actions.fetchListing();

        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.text()).toContain('fallback_component');
    });

    test('should show fallback icon when marketplace icon is missing', async () => {
        const props = {
            ...baseProps,
            actions: {
                fetchListing: jest.fn().mockResolvedValue({data: []}),
            },
            marketplaceListing: [
                {
                    ...marketplaceListing[0],
                    icon_data: '',
                },
            ],
        };

        const wrapper = shallow<AppBar>(
            <AppBar {...props}/>,
        );

        await props.actions.fetchListing();

        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.text()).toContain('fallback_component');
    });
});
