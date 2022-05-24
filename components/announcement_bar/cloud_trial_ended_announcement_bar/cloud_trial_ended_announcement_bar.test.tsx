// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import * as reactRedux from 'react-redux';
import configureStore from 'redux-mock-store';

import {FileSizes} from 'utils/file_utils';
import {CloudProducts, Preferences, CloudBanners} from 'utils/constants';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import CloudTrialEndAnnouncementBar from './index';

describe('components/global/CloudTrialEndAnnouncementBar', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

    beforeEach(() => {
        useDispatchMock.mockClear();
    });
    const initialState = {
        views: {
            announcementBar: {
                announcementBarState: {
                    announcementBarCount: 1,
                },
            },
        },
        entities: {
            preferences: {
                myPreferences: {
                    category: Preferences.FREEMIUM_TRIAL_END_BANNER,
                    name: CloudBanners.HIDE,
                    user_id: 'current_user_id',
                    value: 'false',
                },
            },
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
                    trial_end_at: 1652807380,
                    is_free_trial: 'false',
                },
                products: {
                    test_prod_1: {
                        id: 'test_prod_1',
                        sku: CloudProducts.STARTER,
                        price_per_seat: 0,
                    },
                },
                limits: {
                    limitsLoaded: true,
                    limits: {
                        integrations: {
                            enabled: 10,
                        },
                        messages: {
                            history: 10000,
                        },
                        files: {
                            total_storage: 10 * FileSizes.Gigabyte,
                        },
                        teams: {
                            active: 1,
                        },
                        boards: {
                            cards: 500,
                            views: 5,
                        },
                    },
                },
            },
        },
    };
    it('Should show banner when not on free trial with a trial_end_at in the past', () => {
        const state = {
            ...initialState,
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mountWithIntl(
            <reactRedux.Provider store={store}>
                <CloudTrialEndAnnouncementBar/>
            </reactRedux.Provider>,
        );

        expect(
            wrapper.find('AnnouncementBar').exists(),
        ).toEqual(true);
    });

    it('should not show banner if on free trial', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.cloud = {
            subscription: {
                product_id: 'test_prod_2',
                is_free_trial: 'true',
                trial_end_at: new Date(
                    new Date().getTime() + (2 * 24 * 60 * 60 * 1000),
                ),
            },
            products: {
                test_prod_2: {
                    id: 'test_prod_2',
                    sku: CloudProducts.ENTERPRISE,
                    price_per_seat: 10,
                },
            },
            limits: {
                limitsLoaded: true,
                limits: {
                    integrations: {
                        enabled: 10,
                    },
                    messages: {
                        history: 10000,
                    },
                    files: {
                        total_storage: 10 * FileSizes.Gigabyte,
                    },
                    teams: {
                        active: 1,
                    },
                    boards: {
                        cards: 500,
                        views: 5,
                    },
                },
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = mountWithIntl(
            <reactRedux.Provider store={store}>
                <CloudTrialEndAnnouncementBar/>
            </reactRedux.Provider>,
        );

        expect(
            wrapper.find('AnnouncementBar').exists(),
        ).toEqual(false);
    });

    it('should not show for non-admins', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.users = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'user'},
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);
        const wrapper = mountWithIntl(
            <reactRedux.Provider store={store}>
                <CloudTrialEndAnnouncementBar/>
            </reactRedux.Provider>,
        );

        expect(
            wrapper.find('AnnouncementBar').exists(),
        ).toEqual(false);
    });

    it('Should not show banner if preference is set to hidden', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.preferences = {
            myPreferences: {
                [getPreferenceKey(Preferences.FREEMIUM_TRIAL_END_BANNER, CloudBanners.HIDE)]: {name: CloudBanners.HIDE, value: 'true'},
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);
        const wrapper = mountWithIntl(
            <reactRedux.Provider store={store}>
                <CloudTrialEndAnnouncementBar/>
            </reactRedux.Provider>,
        );

        expect(
            wrapper.find('AnnouncementBar').exists(),
        ).toEqual(false);
    });
});
