// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MarketplaceItemPlugin, {MarketplaceItemAppProps} from './marketplace_item_app';

describe('components/MarketplaceItemPlugin', () => {
    describe('MarketplaceItem', () => {
        const baseProps: MarketplaceItemAppProps = {
            id: 'id',
            name: 'name',
            description: 'test plugin',
            homepage_url: 'http://example.com',
            root_url: 'http://example.com/install',
            installed: false,
            trackEvent: jest.fn(() => {}),
            actions: {
                installApp: jest.fn(() => {}),
                closeMarketplaceModal: jest.fn(() => {}),
            },
        };

        test('should render', () => {
            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...baseProps}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with no plugin description', () => {
            const props = {...baseProps};
            delete props.description;

            const wrapper = shallow(
                <MarketplaceItemPlugin {...props}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with no homepage url', () => {
            const props = {...baseProps};
            delete props.homepage_url;

            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...props}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render installed app', () => {
            const props = {
                ...baseProps,
                installed: true,
            };

            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...props}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with empty list of labels', () => {
            const props = {
                ...baseProps,
                labels: [],
            };

            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...props}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with one labels', () => {
            const props = {
                ...baseProps,
                labels: [
                    {
                        name: 'someName',
                        description: 'some description',
                        url: 'http://example.com/info',
                    },
                ],
            };

            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...props}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with two labels', () => {
            const props = {
                ...baseProps,
                labels: [
                    {
                        name: 'someName',
                        description: 'some description',
                        url: 'http://example.com/info',
                    }, {
                        name: 'someName2',
                        description: 'some description2',
                        url: 'http://example.com/info2',
                    },
                ],
            };

            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...props}/>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        describe('install should trigger track event and close modal', () => {
            const props = {
                ...baseProps,
                isDefaultMarketplace: true,
            };

            const wrapper = shallow<MarketplaceItemPlugin>(
                <MarketplaceItemPlugin {...props}/>,
            );

            wrapper.instance().onInstall();
            expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_install_app', {
                app_id: 'id',
            });
            expect(props.actions.installApp).toHaveBeenCalledWith('id', 'http://example.com/install');
            expect(props.actions.closeMarketplaceModal).toBeCalled();
        });
    });
});
