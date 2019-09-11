// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MarketplaceModal from './marketplace_modal.jsx';

describe('components/MarketplaceModal', () => {
    const marketplacePluginsSample = [{
        HomepageURL: 'https://github.com/mattermost/mattermost-plugin-nps',
        DownloadURL: 'https://github.com/mattermost/mattermost-plugin-nps/releases/download/v1.0.3/com.mattermost.nps-1.0.3.tar.gz',
        Manifest: {
            Id: 'com.mattermost.nps',
            Name: 'User Satisfaction Surveys',
            Description: 'This plugin sends quarterly user satisfaction surveys to gather feedback and help improve Mattermost',
            Version: '1.0.3',
            MinServerVersion: '5.14.0',
        },
        InstalledVersion: '',
    }];

    const installedPlugins = [];

    const defaultProps = {
        show: true,
        installedPlugins,
        marketplacePlugins: marketplacePluginsSample,
        serverError: null,
        actions: {
            closeModal: jest.fn(),
            getMarketplacePlugins: jest.fn(),
        },
    };

    test('should match the snapshot, no plugins installed', () => {
        const wrapper = shallow(
            <MarketplaceModal {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot, with plugins installed', () => {
        const installedPlugin = {
            HomepageURL: 'https://github.com/mattermost/mattermost-test',
            DownloadURL: 'https://github.com/mattermost/mattermost-test/releases/download/v1.0.3/com.mattermost.nps-1.0.3.tar.gz',
            Manifest: {
                Id: 'com.mattermost.test',
                Name: 'Test',
                Description: 'This plugin is to test',
                Version: '1.0.3',
                MinServerVersion: '5.14.0',
            },
            InstalledVersion: '1.0.3',
        };

        marketplacePluginsSample.push(installedPlugin);
        installedPlugins.push(installedPlugin);

        const wrapper = shallow(
            <MarketplaceModal {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
