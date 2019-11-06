// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import {Plugins, AllPlugins, InstalledPlugins, MarketplaceModal} from './marketplace_modal';

describe('components/marketplace/', () => {
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

    const sampleInstalledPlugin = {
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

    describe('Plugins', () => {
        it('should render with no plugins', () => {
            const wrapper = shallowWithIntl(
                <Plugins plugins={[]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render with one plugin', () => {
            const wrapper = shallowWithIntl(
                <Plugins plugins={[samplePlugin]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render with multiple plugins', () => {
            const wrapper = shallowWithIntl(
                <Plugins plugins={[samplePlugin, sampleInstalledPlugin]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('AllPlugins', () => {
        it('should render with no plugins', () => {
            const wrapper = shallowWithIntl(
                <AllPlugins plugins={[]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render with one plugin', () => {
            const wrapper = shallowWithIntl(
                <AllPlugins plugins={[samplePlugin]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render with plugins', () => {
            const wrapper = shallowWithIntl(
                <AllPlugins plugins={[samplePlugin, sampleInstalledPlugin]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('InstalledPlugins', () => {
        it('should render with no plugins', () => {
            const wrapper = shallowWithIntl(
                <InstalledPlugins installedPlugins={[]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render with one plugin', () => {
            const wrapper = shallowWithIntl(
                <InstalledPlugins installedPlugins={[sampleInstalledPlugin]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render with multiple plugins', () => {
            const wrapper = shallowWithIntl(
                <InstalledPlugins installedPlugins={[sampleInstalledPlugin, sampleInstalledPlugin]}/>
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('MarketplaceModal', () => {
        const baseProps = {
            show: true,
            plugins: [samplePlugin],
            installedPlugins: [],
            pluginStatuses: {},
            siteURL: 'http://example.com',
            actions: {
                closeModal: jest.fn(),
                fetchPlugins: jest.fn(() => ({})),
                filterPlugins: jest.fn(() => ({})),
            },
        };

        test('should render with no plugins installed', () => {
            const wrapper = shallowWithIntl(
                <MarketplaceModal {...baseProps}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should render with plugins installed', () => {
            const props = {
                ...baseProps,
                plugins: [
                    ...baseProps.plugins,
                    sampleInstalledPlugin,
                ],
                installedPlugins: [
                    sampleInstalledPlugin,
                ],
            };

            const wrapper = shallowWithIntl(
                <MarketplaceModal {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should fetch plugins when plugin status is changed', () => {
            const fetchPlugins = baseProps.actions.fetchPlugins;
            const wrapper = shallowWithIntl(<MarketplaceModal {...baseProps}/>);

            expect(fetchPlugins).toBeCalledTimes(1);
            wrapper.setProps({...baseProps});
            expect(fetchPlugins).toBeCalledTimes(1);

            wrapper.setProps({...baseProps, pluginStatuses: {test: 'test'}});
            expect(fetchPlugins).toBeCalledTimes(2);
        });

        test('should render with error banner', () => {
            const wrapper = shallowWithIntl(
                <MarketplaceModal {...baseProps}/>
            );

            wrapper.setState({serverError: {message: 'Error test'}});

            expect(wrapper).toMatchSnapshot();
        });
    });
});
