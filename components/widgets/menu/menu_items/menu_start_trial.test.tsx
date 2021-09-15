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
});
