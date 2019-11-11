// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MarketplaceItem from './marketplace_item';

describe('components/MarketplaceItem', () => {
    const baseProps = {
        id: 'id',
        name: 'name',
        description: 'test plugin',
        version: '1.0.0',
        downloadUrl: 'http://example.com/download',
        signatureUrl: 'http://example.com/signature',
        homepageUrl: 'http://example.com',
        installedVersion: '',
        iconUrl: '',
        iconData: 'icon',
        installing: false,
        actions: {
            installPlugin: () => {}, // eslint-disable-line no-empty-function
            closeMarketplaceModal: () => {}, // eslint-disable-line no-empty-function
        },
    };

    test('should render', () => {
        const wrapper = shallow(
            <MarketplaceItem {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render with no plugin icon', () => {
        const props = {...baseProps};
        delete props.iconData;

        const wrapper = shallow(
            <MarketplaceItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render with no homepage url', () => {
        const props = {...baseProps};
        delete props.homepageUrl;

        const wrapper = shallow(
            <MarketplaceItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render with server error', () => {
        const props = {
            ...baseProps,
            error: 'An error occurred.',
        };

        const wrapper = shallow(
            <MarketplaceItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render installed plugin', () => {
        const props = {
            ...baseProps,
            installedVersion: '1.0.0',
        };

        const wrapper = shallow(
            <MarketplaceItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render with update available', () => {
        const props = {
            ...baseProps,
            installedVersion: '0.9.9',
        };

        const wrapper = shallow(
            <MarketplaceItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
