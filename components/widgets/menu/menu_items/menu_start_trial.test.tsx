// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import configureStore from 'redux-mock-store';

import * as reactRedux from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import MenuStartTrial from './menu_start_trial';

describe('components/widgets/menu/menu_items/menu_start_trial', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

    beforeEach(() => {
        useDispatchMock.mockClear();
    });

    const mockStore = configureStore();

    test('should render when no trial license has ever been used and there is no license currently loaded', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'false',
                    },
                },
                admin: {
                    prevTrialLicense: {
                        IsLicensed: 'false',
                    },
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = mountWithIntl(<reactRedux.Provider store={store}><MenuStartTrial id='startTrial'/></reactRedux.Provider>);
        expect(wrapper.find('button').exists()).toEqual(true);
    });

    test('should render null when prevTrialLicense was used and there is no license currently loaded', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'false',
                        IsTrial: 'false',
                    },
                },
                admin: {
                    prevTrialLicense: {
                        IsLicensed: 'true',
                    },
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = mountWithIntl(<reactRedux.Provider store={store}><MenuStartTrial id='startTrial'/></reactRedux.Provider>);
        expect(wrapper.find('button').exists()).toEqual(false);
    });

    test('should render null when no trial license has ever been used but there is a license currently loaded', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        IsTrial: 'false',
                    },
                },
                admin: {
                    prevTrialLicense: {
                        IsLicensed: 'false',
                    },
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = mountWithIntl(<reactRedux.Provider store={store}><MenuStartTrial id='startTrial'/></reactRedux.Provider>);
        expect(wrapper.find('button').exists()).toEqual(false);
    });

    test('should render menu option that open the start trial benefits modal when is current licensed but is trial', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        IsTrial: 'true',
                    },
                },
                admin: {
                    prevTrialLicense: {
                        IsLicensed: 'false',
                    },
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = mountWithIntl(<reactRedux.Provider store={store}><MenuStartTrial id='startTrial'/></reactRedux.Provider>);
        expect(wrapper.find('button').exists()).toEqual(true);
        expect(wrapper.find('button').text()).toEqual('Learn More');
    });

    test('should render menu option that open the start trial modal when has no license and no previous license', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'false',
                        IsTrial: 'false',
                    },
                },
                admin: {
                    prevTrialLicense: {
                        IsLicensed: 'false',
                    },
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = mountWithIntl(<reactRedux.Provider store={store}><MenuStartTrial id='startTrial'/></reactRedux.Provider>);
        expect(wrapper.find('button').exists()).toEqual(true);
        expect(wrapper.find('button').text()).toEqual('Start Trial');
    });
});
