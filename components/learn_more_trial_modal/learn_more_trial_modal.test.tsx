// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {shallow} from 'enzyme';

import Carousel from 'components/common/carousel/carousel';
import LearnMoreTrialModal from 'components/learn_more_trial_modal/learn_more_trial_modal';
import GenericModal from 'components/generic_modal';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');
    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

describe('components/learn_more_trial_modal/learn_more_trial_modal', () => {
    // required state to mount using the provider
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

    const props = {
        onExited: jest.fn(),
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <LearnMoreTrialModal {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should show the learn more about trial modal carousel slides', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <LearnMoreTrialModal {...props}/>
            </Provider>,
        );
        expect(wrapper.find('LearnMoreTrialModal').find('Carousel')).toHaveLength(1);
    });

    test('should call on close', () => {
        const mockOnClose = jest.fn();

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <LearnMoreTrialModal
                    {...props}
                    onClose={mockOnClose}
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
                <LearnMoreTrialModal
                    {...props}
                    onExited={mockOnExited}
                />
            </Provider>,
        );

        wrapper.find(GenericModal).props().onExited();

        expect(mockOnExited).toHaveBeenCalled();
    });

    test('should move the slides when clicking carousel next and prev buttons', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <LearnMoreTrialModal
                    {...props}
                />
            </Provider>,
        );

        // validate the value of the first slide
        let activeSlide = wrapper.find(Carousel).find('.slide.active-anim');
        let activeSlideId = activeSlide.find('LearnMoreTrialModalStep').props().id;

        expect(activeSlideId).toBe('guestAccess');

        const nextButton = wrapper.find(Carousel).find('CarouselButton a.next');
        const prevButton = wrapper.find(Carousel).find('CarouselButton a.prev');

        // move to the second slide
        nextButton.simulate('click');

        activeSlide = wrapper.find(Carousel).find('.slide.active-anim');
        activeSlideId = activeSlide.find('LearnMoreTrialModalStep').props().id;

        expect(activeSlideId).toBe('complianceExport');

        // move to the third slide
        nextButton.simulate('click');

        activeSlide = wrapper.find(Carousel).find('.slide.active-anim');
        activeSlideId = activeSlide.find('LearnMoreTrialModalStep').props().id;

        expect(activeSlideId).toBe('pushNotificationService');

        // move back to the second slide
        prevButton.simulate('click');

        activeSlide = wrapper.find(Carousel).find('.slide.active-anim');
        activeSlideId = activeSlide.find('LearnMoreTrialModalStep').props().id;

        expect(activeSlideId).toBe('complianceExport');
    });
});
