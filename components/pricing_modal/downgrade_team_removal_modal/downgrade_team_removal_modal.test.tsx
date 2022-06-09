// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ReactWrapper, shallow} from 'enzyme';

import configureStore from 'redux-mock-store';

import {Provider} from 'react-redux';

import thunk from 'redux-thunk';

import {act} from 'react-dom/test-utils';

import * as cloudActions from 'actions/cloud';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

import DowngradeTeamRemovalModal from './';

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');
    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

jest.mock('mattermost-redux/actions/general', () => ({
    ...jest.requireActual('mattermost-redux/actions/general'),
    getLicenseConfig: () => ({type: 'adsf'}),
}));

describe('components/cloud_start_trial_btn/cloud_start_trial_btn', () => {
    const state = {
        entities: {
            admin: {},
            general: {
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                },
            },
            cloud: {
                subscription: {
                    is_free_trial: 'false',
                    trial_end_at: 0,
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

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <DowngradeTeamRemovalModal product_id={'cloud-starter'}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    // test('should handle on click and change button text on SUCCESSFUL trial request', async () => {
    //     const mockOnClick = jest.fn();
    //     type RequestTrialFnType = (page: string) => () => Promise<boolean>;
    //     const requestTrialFn = (() => () =>
    //         true) as unknown as RequestTrialFnType;
    //     jest.spyOn(cloudActions, 'requestCloudTrial').mockImplementation(
    //         requestTrialFn,
    //     );

    //     let wrapper: ReactWrapper<any>;

    //     // Mount the component
    //     await act(async () => {
    //         wrapper = mountWithIntl(
    //             <Provider store={store}>
    //                 <DowngradTeamRemovalModal
    //                     {...props}
    //                     onClick={mockOnClick}
    //                     email='fakeemail@topreventbusinessemailvalidation'
    //                 />
    //             </Provider>,
    //         );
    //     });

    //     await act(async () => {
    //         expect(
    //             wrapper.
    //                 find('.DowngradTeamRemovalModal').
    //                 text().
    //                 includes('Cloud Start trial'),
    //         ).toBe(true);
    //     });

    //     await act(async () => {
    //         wrapper.find('.DowngradTeamRemovalModal').simulate('click');
    //     });

    //     await act(async () => {
    //         expect(
    //             wrapper.
    //                 find('.DowngradTeamRemovalModal').
    //                 text().
    //                 includes('Loaded!'),
    //         ).toBe(true);
    //     });

    //     expect(mockOnClick).toHaveBeenCalled();

    //     expect(trackEvent).toHaveBeenCalledWith(
    //         TELEMETRY_CATEGORIES.CLOUD_START_TRIAL_BUTTON,
    //         'test_telemetry_id',
    //     );
    // });
});
