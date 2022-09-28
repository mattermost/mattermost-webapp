// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import * as reactRedux from 'react-redux';
import mockStore from 'tests/test_store';

import {LicenseSkus} from 'utils/constants';

import ADLDAPUpsellBanner from './ad_ldap_upsell_banner';

describe('component/user_groups_modal/ad_ldap_upsell_banner', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');

    beforeEach(() => {
        useDispatchMock.mockClear();
        useSelectorMock.mockClear();
    });

    const initState = {
        entities: {
            general: {
                license: {
                    Cloud: 'false',
                    SkuShortName: LicenseSkus.Professional,
                    ExpiresAt: 100000000,
                },
            },
            admin: {
                prevTrialLicense: {
                    IsLicensed: 'false',
                },
            },
            users: {
                currentUserId: 'user1',
                profiles: {
                    user1: {
                        id: 'user1',
                        roles: 'system_admin',
                    },
                },
            },
        },
    };

    test('should display for admin users on professional with option to start trial if no trial before', () => {
        const store = mockStore(initState);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <ADLDAPUpsellBanner/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('#ad_ldap_upsell_banner')).toHaveLength(1);
        expect(wrapper.find('.ad-ldap-banner-btn').text()).toEqual('Try free for 30 days');
    });

    test('should display for admin users on professional with option to contact sales if trialed before', () => {
        const state = JSON.parse(JSON.stringify(initState));
        state.entities.admin.prevTrialLicense.IsLicensed = 'true';
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <ADLDAPUpsellBanner/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('#ad_ldap_upsell_banner')).toHaveLength(1);
        expect(wrapper.find('.ad-ldap-banner-btn').text()).toEqual('Contact sales to use');
    });

    test('should not display for non admin users', () => {
        const state = JSON.parse(JSON.stringify(initState));
        state.entities.users.profiles.user1.roles = 'system_user';
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <ADLDAPUpsellBanner/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('#ad_ldap_upsell_banner')).toHaveLength(0);
    });

    test('should not display for non professional users', () => {
        const state = JSON.parse(JSON.stringify(initState));
        state.entities.general.license.SkuShortName = LicenseSkus.Enterprise;
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <ADLDAPUpsellBanner/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('#ad_ldap_upsell_banner')).toHaveLength(0);
    });

    test('should not display for cloud', () => {
        const state = JSON.parse(JSON.stringify(initState));
        state.entities.general.license.Cloud = 'true';
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mount(
            <reactRedux.Provider store={store}>
                <ADLDAPUpsellBanner/>
            </reactRedux.Provider>,
        );

        expect(wrapper.find('#ad_ldap_upsell_banner')).toHaveLength(0);
    });
});
