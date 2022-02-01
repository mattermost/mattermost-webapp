// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow, mount} from 'enzyme';
import * as reactRedux from 'react-redux';
import configureStore from 'redux-mock-store';

import {TopLevelProducts} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import * as hooks from '../../hooks';

import ProductMenu, {ProductMenuButton, ProductMenuContainer} from './product_menu';
import ProductMenuItem from './product_menu_item';
import ProductMenuList from './product_menu_list';

const spyProduct = jest.spyOn(hooks, 'useCurrentProductId');
spyProduct.mockReturnValue(null);

describe('components/global/product_switcher', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
    const mockStore = configureStore();

    beforeEach(() => {
        const products = [
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ];
        const spyProducts = jest.spyOn(hooks, 'useProducts');
        spyProducts.mockReturnValue(products);
        useDispatchMock.mockClear();
        useSelectorMock.mockClear();
    });

    it('should match snapshot', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = shallow(<reactRedux.Provider store={store}><ProductMenu/></reactRedux.Provider>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should render once when there are no top level products available', () => {
        const state = {
            users: {
                currentUserId: 'test_id',
            },
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        useSelectorMock.mockReturnValue(true);
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        const spyProducts = jest.spyOn(hooks, 'useProducts');

        spyProducts.mockReturnValue([]);
        expect(wrapper.find(ProductMenuItem).at(0)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render the correct amount of times when there are products available', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        useSelectorMock.mockReturnValue(true);
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });
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
        const state = {
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        useSelectorMock.mockReturnValue(true);
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });
        const setState = jest.fn();

        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation(() => [false, setState]);

        wrapper.find(ProductMenuContainer).simulate('click');
        expect(wrapper.find(ProductMenuButton).props().active).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with product switcher menu', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        useSelectorMock.mockReturnValue(true);
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper.find(ProductMenuList)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });
});
