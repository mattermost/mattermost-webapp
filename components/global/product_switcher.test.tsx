// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {mount, shallow} from 'enzyme';
import {TopLevelProducts} from 'utils/constants';
import configureStore from 'redux-mock-store';

import ProductSwitcher, {SwitcherNavEntry, SwitcherNavEntryProps} from 'components/global/product_switcher';

import * as hooks from './hooks';
import { Provider } from 'react-redux';
import { ProductComponent } from 'types/store/plugins';

const defaultNavProps: SwitcherNavEntryProps = {
    destination: '',
    icon: 'product-channels',
    text: 'Channels',
    active: true,
    onClick: jest.fn(),
};

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

const initialState = {
    plugins: {
        components: {}
    },
};

const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
spyProduct.mockReturnValue(null);

const mockStore = configureStore();
const store = mockStore({initialState});
const wrapper = shallow(
    <Provider store={store}>
        <ProductSwitcher/>
    </Provider>,
);

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
        expect(wrapper).toMatchSnapshot();
    });

    it('should close the menu when clicked outside', () => {
        const setState = jest.fn();
        console.log(wrapper.html())

        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation(() => [true, setState]);
        jest.spyOn(hooks, 'useClickOutsideRef');
        wrapper.parents().first().simulate('click');

        expect(setState).toHaveBeenCalledWith(false);
    })
    // it('should render once when there are no top level products available', () => {
    //     expect(wrapper.at(0).find(SwitcherNavEntry)).toHaveLength(1)
    // });

    // it('should render the correct amount of times when there are products available', () => {
    //     const spyProducts = jest.spyOn(hooks, 'useProducts');
    //     spyProducts.mockReturnValue(products);
    //     expect(wrapper.at(0).find('.MenuItem')).toHaveLength(2)
    // });
});
