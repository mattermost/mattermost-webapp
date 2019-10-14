// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import MarketplaceModal from './marketplace_modal.jsx';

describe('components/MarketplaceModal', () => {
    const marketplacePluginsSample = [{
        homepage_url: 'https://github.com/mattermost/mattermost-plugin-nps',
        download_url: 'https://github.com/mattermost/mattermost-plugin-nps/releases/download/v1.0.3/com.mattermost.nps-1.0.3.tar.gz',
        manifest: {
            id: 'com.mattermost.nps',
            name: 'User Satisfaction Surveys',
            description: 'This plugin sends quarterly user satisfaction surveys to gather feedback and help improve Mattermost',
            version: '1.0.3',
            minServerVersion: '5.14.0',
        },
        installed_version: '',
    }];

    const installedPlugins = [];
    let defaultProps;

    beforeEach(async () => {
        defaultProps = {
            show: true,
            installedPlugins,
            marketplacePlugins: marketplacePluginsSample,
            pluginStatuses: {},
            siteURL: 'http://example.com',
            actions: {
                closeModal: jest.fn(),
                getMarketplacePlugins: jest.fn(),
            },
        };
    });

    test('should match the snapshot, no plugins installed', () => {
        const wrapper = shallowWithIntl(
            <MarketplaceModal {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot, with plugins installed', () => {
        const installedPlugin = {
            homepage_url: 'https://github.com/mattermost/mattermost-test',
            download_url: 'https://github.com/mattermost/mattermost-test/releases/download/v1.0.3/com.mattermost.nps-1.0.3.tar.gz',
            manifest: {
                id: 'com.mattermost.test',
                name: 'Test',
                description: 'This plugin is to test',
                version: '1.0.3',
                minServerVersion: '5.14.0',
            },
            installed_version: '1.0.3',
        };

        marketplacePluginsSample.push(installedPlugin);
        installedPlugins.push(installedPlugin);

        const wrapper = shallowWithIntl(
            <MarketplaceModal {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should fetch marketplace plugins when plugin status is changed', () => {
        const getMarketplacePlugins = defaultProps.actions.getMarketplacePlugins;
        const wrapper = shallowWithIntl(<MarketplaceModal {...defaultProps}/>);

        expect(getMarketplacePlugins).toBeCalledTimes(1);
        wrapper.setProps({...defaultProps});
        expect(getMarketplacePlugins).toBeCalledTimes(1);

        wrapper.setProps({...defaultProps, pluginStatuses: {test: 'test'}});
        expect(getMarketplacePlugins).toBeCalledTimes(2);
    });

    test('should match the snapshot, error banner is shown', () => {
        const wrapper = shallowWithIntl(
            <MarketplaceModal {...defaultProps}/>
        );

        wrapper.setState({serverError: {message: 'Error test'}});

        expect(wrapper).toMatchSnapshot();
    });
});
