// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';
import Icon from '@mattermost/compass-components/foundations/icon';

import {TopLevelProducts} from 'utils/constants';

import * as hooks from '../../../hooks';
import {TestHelper} from 'utils/test_helper';

import ProductBranding from './product_branding';

describe('components/ProductBranding', () => {
    test('should show correct icon glyph when we are on Channels', () => {
        const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
        spyProduct.mockReturnValue('Channels');
        const products = jest.spyOn(hooks, 'useProducts');
        products.mockReturnValue([]);

        const wrapper = shallow(
            <ProductBranding/>,
        );

        expect(wrapper.find(Icon).prop('glyph')).toEqual('product-channels');
        expect(wrapper).toMatchSnapshot();
    });

    test('should show correct icon glyph when we are on Playbooks', () => {
        const products = jest.spyOn(hooks, 'useProducts');
        products.mockReturnValue([
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ]);

        const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
        spyProduct.mockReturnValue('Playbooks');
        const wrapper = shallow(
            <ProductBranding/>,
        );

        expect(wrapper.find(Icon).prop('glyph')).toEqual('product-playbooks');
        expect(wrapper).toMatchSnapshot();
    });

    test('should show correct icon glyph when we are on Boards', () => {
        const products = jest.spyOn(hooks, 'useProducts');
        products.mockReturnValue([
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ]);

        const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
        spyProduct.mockReturnValue('Boards');
        const wrapper = shallow(
            <ProductBranding/>,
        );

        expect(wrapper.find(Icon).prop('glyph')).toEqual('product-boards');
        expect(wrapper).toMatchSnapshot();
    });
});
