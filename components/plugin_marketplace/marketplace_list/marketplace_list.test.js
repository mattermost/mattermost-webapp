// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MarketplaceList from './marketplace_list';

describe('components/marketplace/marketplace_list', () => {
    const samplePlugin = {
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
    };

    it('should render with multiple plugins', () => {
        const wrapper = shallow(
            <MarketplaceList
                theme={{centerChannelColor: '#3d3c40'}}
                plugins={[
                    samplePlugin, samplePlugin, samplePlugin, samplePlugin, samplePlugin,
                    samplePlugin, samplePlugin, samplePlugin, samplePlugin, samplePlugin,
                    samplePlugin, samplePlugin, samplePlugin, samplePlugin, samplePlugin,
                    samplePlugin, samplePlugin
                ]}
            />
        );
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.state('page')).toEqual(0);
        expect(wrapper.find('Connect(MarketplaceItem)')).toHaveLength(15);
        expect(wrapper.find('#marketplaceModalNextButton')).toHaveLength(1);
        expect(wrapper.find('#marketplaceModalPreviousButton')).toHaveLength(0);

        wrapper.find('#marketplaceModalNextButton').simulate('click', {preventDefault: jest.fn});

        expect(wrapper.state('page')).toEqual(1);
        expect(wrapper.find('Connect(MarketplaceItem)')).toHaveLength(2);
        expect(wrapper.find('#marketplaceModalNextButtXon')).toHaveLength(0);
        expect(wrapper.find('#marketplaceModalPreviousButton')).toHaveLength(1);
    });

    it('should set page to 0 when list of plugins changed', () => {
        const wrapper = shallow(
            <MarketplaceList
                theme={{centerChannelColor: '#3d3c40'}}
                plugins={[samplePlugin, samplePlugin]}
            />
        );

        wrapper.setState({page: 10});
        wrapper.setProps({plugins: [samplePlugin]});

        expect(wrapper.state('page')).toEqual(0);
    });
});
