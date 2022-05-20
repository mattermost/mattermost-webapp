// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import configureStore from 'redux-mock-store';

import {Provider} from 'react-redux';

import thunk from 'redux-thunk';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import LearnMoreTrialModalStep from 'components/learn_more_trial_modal/learn_more_trial_modal_step';

describe('components/learn_more_trial_modal/learn_more_trial_modal_step', () => {
    const props = {
        id: 'stepId',
        title: 'Step title',
        description: 'Step description',
        svgWrapperClassName: 'stepClassname',
        svgElement: <svg/>,
        buttonLabel: 'button',
        isCloudFree: false,
    };

    const state = {
        entities: {
            admin: {
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

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <LearnMoreTrialModalStep {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with optional params', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <LearnMoreTrialModalStep
                    {...props}
                    bottomLeftMessage='Step bottom message'
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when loaded in cloud workspace', () => {
        const cloudProps = {...props, isCloud: true, isCloudFreeEnabled: true};
        const wrapper = shallow(
            <Provider store={store}>
                <LearnMoreTrialModalStep
                    {...cloudProps}
                    bottomLeftMessage='Step bottom message'
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have the start cloud trial button when is cloud workspace and cloud free is enabled', () => {
        const cloudProps = {...props, isCloudFree: true};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <LearnMoreTrialModalStep
                    {...cloudProps}
                    bottomLeftMessage='Step bottom message'
                />
            </Provider>,
        );

        const trialButton = wrapper.find('CloudStartTrialButton');

        expect(trialButton).toHaveLength(1);
    });

    test('should have the self hosted request trial button cloud free is disabled', () => {
        const cloudProps = {...props, isCloudFree: false};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <LearnMoreTrialModalStep
                    {...cloudProps}
                    bottomLeftMessage='Step bottom message'
                />
            </Provider>,
        );

        // validate the cloud start trial button is not present
        const trialButton = wrapper.find('CloudStartTrialButton');
        expect(trialButton).toHaveLength(0);

        // validate the cloud start trial button is not present
        const selfHostedRequestTrialButton = wrapper.find('StartTrialBtn');
        expect(selfHostedRequestTrialButton).toHaveLength(1);
    });
});
