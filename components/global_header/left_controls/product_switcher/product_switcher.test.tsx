// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import ProductSwitcher, {SwitcherNavEntry, ProductSwitcherButton, ProductSwitcherContainer} from './product_switcher';
import ProductSwitcherMenu from './product_switcher_menu';
import {ProductComponent} from 'types/store/plugins';
import {TopLevelProducts} from 'utils/constants';

import * as hooks from '../../hooks';

function makeProduct(name: string): ProductComponent {
    return {
        id: '',
        pluginId: '',
        switcherIcon: 'none',
        switcherText: name,
        baseURL: '',
        switcherLinkURL: '',
        mainComponent: null,
        headerCentreComponent: null,
        headerRightComponent: null,
    };
}

const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
spyProduct.mockReturnValue(null);

describe('components/global/product_switcher', () => {
    beforeEach(() => {
        const products = [
            makeProduct(TopLevelProducts.BOARDS),
            makeProduct(TopLevelProducts.PLAYBOOKS),
        ];
        const spyProducts = jest.spyOn(hooks, 'useProducts');
        spyProducts.mockReturnValue(products);
    });

    it('should match snapshot', () => {
        const wrapper = shallow(<ProductSwitcher/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should render once when there are no top level products available', () => {
        const wrapper = shallow(<ProductSwitcher/>);

        const spyProducts = jest.spyOn(hooks, 'useProducts');

        spyProducts.mockReturnValue([]);
        expect(wrapper.find(SwitcherNavEntry).at(0)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render the correct amount of times when there are products available', () => {
        const wrapper = shallow(<ProductSwitcher/>);
        const products = [
            makeProduct(TopLevelProducts.BOARDS),
            makeProduct(TopLevelProducts.PLAYBOOKS),
        ];

        const spyProducts = jest.spyOn(hooks, 'useProducts');
        spyProducts.mockReturnValue(products);

        expect(wrapper.find(SwitcherNavEntry)).toHaveLength(3);
        expect(wrapper).toMatchSnapshot();
    });

    it('should have an active button state when the switcher menu is open', () => {
        const wrapper = shallow(<ProductSwitcher/>);
        const setState = jest.fn();

        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation(() => [false, setState]);

        wrapper.find(ProductSwitcherContainer).simulate('click');
        expect(wrapper.find(ProductSwitcherButton).props().active).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with product switcher menu', () => {
        const wrapper = shallow(<ProductSwitcher/>);

        expect(wrapper.find(ProductSwitcherMenu)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });
});