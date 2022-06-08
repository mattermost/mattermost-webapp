// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {shallow} from 'enzyme';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import Carousel from 'components/common/carousel/carousel';
import TrialBenefitsModal from 'components/trial_benefits_modal/trial_benefits_modal';
import GenericModal from 'components/generic_modal';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');
    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

jest.mock('components/admin_console/blockable_link', () => {
    return () => {
        return <div/>;
    };
});

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
            admin: {
                navigationBlock: {
                    blocked: true,
                },
            },
        },
    };

    const props = {
        onExited: jest.fn(),
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
                <TrialBenefitsModal
                    {...props}
                    trialJustStarted={true}
                />
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

    test('should call on close', () => {
        const mockOnClose = jest.fn();

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <TrialBenefitsModal
                    {...props}
                    onClose={mockOnClose}
                    trialJustStarted={true}
                />
            </Provider>,
        );

        wrapper.find(GenericModal).props().onExited();

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('should call on exited', () => {
        const mockOnExited = jest.fn();

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <TrialBenefitsModal
                    {...props}
                    onExited={mockOnExited}
                />
            </Provider>,
        );

        wrapper.find(GenericModal).props().onExited();

        expect(mockOnExited).toHaveBeenCalled();
    });

    test('should handle slide prev next click', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <TrialBenefitsModal
                    {...props}
                />
            </Provider>,
        );

        wrapper.find(Carousel).props().onNextSlideClick!(5);

        expect(trackEvent).toHaveBeenCalledWith(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'benefits_modal_post_enterprise_view',
        );

        wrapper.find(Carousel).props().onNextSlideClick!(4);

        expect(trackEvent).toHaveBeenCalledWith(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'benefits_modal_slide_shown_playbooks',
        );

        wrapper.find(Carousel).props().onPrevSlideClick!(2);

        expect(trackEvent).toHaveBeenCalledWith(
            TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
            'benefits_modal_slide_shown_complianceExport',
        );
    });

    test('should present the just started trial modal content', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <TrialBenefitsModal
                    {...props}
                    trialJustStarted={true}
                />
            </Provider>,
        );

        const title = wrapper.find('#trialBenefitsModalStarted-trialStart div.title').text();

        expect(title).toBe('Your trial has started! Explore the benefits of Enterprise');
    });
});
