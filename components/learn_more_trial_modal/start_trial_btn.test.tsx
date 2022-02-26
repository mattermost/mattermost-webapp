// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ReactWrapper, shallow} from 'enzyme';

import configureStore from 'redux-mock-store';

import {Provider} from 'react-redux';

import thunk from 'redux-thunk';

import {act} from 'react-dom/test-utils';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import StartTrialBtn from 'components/learn_more_trial_modal/start_trial_btn';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');
    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

describe('components/learn_more_trial_modal/start_trial_btn', () => {
    const state = {
        entities: {
            admin: {
                analytics: {
                    TOTAL_USERS: 9,
                },
                prevTrialLicense: {
                    IsLicensed: 'false',
                },
            },
            general: {
                license: {
                    IsLicensed: 'false',
                },
            },
        },
        views: {
            modals: {
                modalState: {
                    learn_more_trial_modal: {
                        open: 'true',
                    },
                },
            },
        },
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);

    const props = {
        onClick: jest.fn(),
        message: 'Start trial',
        telemetryId: 'test_telemetry_id',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <StartTrialBtn {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should handle on click', async () => {
        const mockOnClick = jest.fn();

        let wrapper: ReactWrapper<any>;

        // Mount the component
        await act(async () => {
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <StartTrialBtn
                        {...props}
                        onClick={mockOnClick}
                    />
                </Provider>,
            );
        });

        await act(async () => {
            wrapper.find('.start-trial-btn').simulate('click');
        });

        expect(mockOnClick).toHaveBeenCalled();

        expect(trackEvent).toHaveBeenCalledWith(TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL, 'test_telemetry_id');
    });
});
