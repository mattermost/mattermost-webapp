// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {shallow} from 'enzyme';

import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

describe('components/trial_benefits_modal/trial_benefits_modal', () => {
    // required state to mount using the provider
    const state = {
        entities: {
            general: {
                license: {
                    IsLicensed: 'false',
                },
            },
        },
        views: {
            modals: {
                modalState: {
                    trial_benefits_modal: {
                        open: 'true',
                    },
                },
            },
        },
    };

    const props = {
        onClose: jest.fn(),
        trialJustStarted: false,
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <TrialBenefitsModal {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when trial has already started', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <TrialBenefitsModal trialJustStarted={true}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should show the benefits modal', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <TrialBenefitsModal {...props}/>
            </Provider>,
        );
        expect(wrapper.find('TrialBenefitsModal').find('Carousel')).toHaveLength(1);
    });

    test('should hide the benefits modal', () => {
        const trialBenefitsModalHidden = {
            modals: {
                modalState: {},
            },
        };
        const localStore = {...state, views: trialBenefitsModalHidden};
        const mockStore = configureStore([thunk]);
        const store = mockStore(localStore);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <TrialBenefitsModal {...props}/>
            </Provider>,
        );
        expect(wrapper.find('TrialBenefitsModal').find('Carousel')).toHaveLength(0);
    });
});
