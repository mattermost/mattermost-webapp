// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import * as reactRedux from 'react-redux';
import configureStore from 'redux-mock-store';

import {CloudProducts} from 'utils/constants';

import CloudUpgradeButton from './index';

describe('components/global/CloudUpgradeButton', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

    beforeEach(() => {
        useDispatchMock.mockClear();
    });
    const initialState = {
        entities: {
            general: {
                config: {
                    FeatureFlagCloudFree: 'true',
                } as any,
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin'},
                },
            },
            cloud: {
                subscription: {
                    product_id: 'test_prod_1',
                },
                products: {
                    test_prod_1: {
                        id: 'test_prod_1',
                        sku: CloudProducts.STARTER,
                        price_per_seat: 0,
                    },
                },
            },
        },
    };
    it('should show Upgrade button in global header for admin users, cloud and starter subscription', () => {
        const state = {
            ...initialState,
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <CloudUpgradeButton/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(true);
    });

    it('should show Upgrade button in global header for admin users, cloud and enterprise trial subscription', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.cloud = {
            subscription: {
                product_id: 'test_prod_2',
                is_free_trial: true,
            },
            products: {
                test_prod_2: {
                    id: 'test_prod_2',
                    sku: CloudProducts.ENTERPRISE,
                    price_per_seat: 10,
                },
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <CloudUpgradeButton/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(true);
    });

    it('should not show for enterprise non-trial', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.cloud = {
            subscription: {
                product_id: 'test_prod_3',
                is_free_trial: false,
            },
            products: {
                test_prod_3: {
                    id: 'test_prod_3',
                    sku: CloudProducts.ENTERPRISE,
                    price_per_seat: 10,
                },
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <CloudUpgradeButton/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(false);
    });

    it('should not show for professional product', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.cloud = {
            subscription: {
                product_id: 'test_prod_4',
                is_free_trial: false,
            },
            products: {
                test_prod_4: {
                    id: 'test_prod_4',
                    sku: CloudProducts.PROFESSIONAL,
                    price_per_seat: 10,
                },
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <CloudUpgradeButton/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(false);
    });

    it('should not show Upgrade button in global header for non admin users', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.users = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_user'},
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <CloudUpgradeButton/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(false);
    });

    it('should not show Upgrade button in global header for non cloud', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.general.license = {
            IsLicensed: 'true',
            Cloud: 'false',
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <CloudUpgradeButton/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(false);
    });
});
