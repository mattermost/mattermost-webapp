// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {TopLevelProducts} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import * as hooks from '../../hooks';

import ProductMenu, {ProductMenuButton, ProductMenuContainer} from './product_menu';
import ProductMenuItem from './product_menu_item';
import ProductMenuList from './product_menu_list';

const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
spyProduct.mockReturnValue(null);

describe('components/global/product_switcher', () => {
    beforeEach(() => {
        const products = [
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ];
        const spyProducts = jest.spyOn(hooks, 'useProducts');
        spyProducts.mockReturnValue(products);
    });

    it('should match snapshot', () => {
        const wrapper = shallow(<ProductMenu/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should render once when there are no top level products available', () => {
        const wrapper = shallow(<ProductMenu/>);

        const spyProducts = jest.spyOn(hooks, 'useProducts');

        spyProducts.mockReturnValue([]);
        expect(wrapper.find(ProductMenuItem).at(0)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render the correct amount of times when there are products available', () => {
        const wrapper = shallow(<ProductMenu/>);
        const products = [
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ];

        const spyProducts = jest.spyOn(hooks, 'useProducts');
        spyProducts.mockReturnValue(products);

        expect(wrapper.find(ProductMenuItem)).toHaveLength(3);
        expect(wrapper).toMatchSnapshot();
    });

    it('should have an active button state when the switcher menu is open', () => {
        const wrapper = shallow(<ProductMenu/>);
        const setState = jest.fn();

        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation(() => [false, setState]);

        wrapper.find(ProductMenuContainer).simulate('click');
        expect(wrapper.find(ProductMenuButton).props().active).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with product switcher menu', () => {
        const wrapper = shallow(<ProductMenu/>);

        expect(wrapper.find(ProductMenuList)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });
});
