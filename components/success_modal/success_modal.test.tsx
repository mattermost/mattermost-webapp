// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
import React from 'react';

import configureStore from 'redux-mock-store';
import * as redux from 'react-redux';

import thunk from 'redux-thunk';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import SuccessModal from './index';

describe('components/pricing_modal/downgrade_team_removal_modal', () => {
    beforeEach(() => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(
            jest.fn(() => jest.fn()),
        );
    });

    const state = {
        entities: {
            cloud: {
                subscription: {
                    is_free_trial: 'false',
                    trial_end_at: 0,
                    product_id: 'prod_starter',
                },
            },
        },
        views: {
            modals: {
                modalState: {
                    success_modal: {
                        open: 'true',
                    },
                },
            },
        },
    };

    test('matches snapshot', () => {
        const mockStore = configureStore([thunk]);
        const store = mockStore(state);
        const wrapper = mountWithIntl(
            <redux.Provider store={store}>
                <SuccessModal/>
            </redux.Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
