// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import NextStepsView from 'components/next_steps_view/next_steps_view';
import {TestHelper} from 'utils/test_helper';

jest.mock('components/next_steps_view/steps', () => ({
    Steps: [
        {
            id: 'step_1',
            title: 'Step_1',
            component: jest.fn(),
        },
        {
            id: 'step_2',
            title: 'Step_2',
            component: jest.fn(),
        },
        {
            id: 'step_3',
            title: 'Step_3',
            component: jest.fn(),
        },
    ],
}));

describe('components/next_steps_view', () => {
    const baseProps = {
        currentUser: TestHelper.getUserMock(),
        preferences: [],
        actions: {
            setShowNextStepsView: jest.fn(),
            savePreferences: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <NextStepsView {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should return complete if pref exists', () => {
        const props = {
            ...baseProps,
            preferences: [{
                category: 'recommended_next_steps',
                name: 'step_1',
                user_id: 'user_id',
                value: 'true',
            }],
        };

        const wrapper: ShallowWrapper<any, any, NextStepsView> = shallow(
            <NextStepsView {...props}/>,
        );

        expect(wrapper.instance().isStepComplete('step_1')).toBe(true);
        expect(wrapper.instance().isStepComplete('step_2')).toBe(false);
    });

    test('should expand next step when previous step is marked complete', () => {
        const wrapper: ShallowWrapper<any, any, NextStepsView> = shallow(
            <NextStepsView {...baseProps}/>,
        );

        const setExpanded = jest.fn();
        wrapper.instance().nextStep(setExpanded, 'step_1');
        expect(setExpanded).toBeCalledWith('step_2');
    });

    test('should go to final screen when last step is marked complete', () => {
        const wrapper: ShallowWrapper<any, any, NextStepsView> = shallow(
            <NextStepsView {...baseProps}/>,
        );

        wrapper.instance().transitionToFinalScreen = jest.fn();
        wrapper.instance().nextStep(jest.fn(), 'step_3');
        expect(wrapper.instance().transitionToFinalScreen).toBeCalled();
    });

    test('should cascade through all steps when all marked complete', () => {
        const props = {
            ...baseProps,
            preferences: [
                {
                    category: 'recommended_next_steps',
                    name: 'step_1',
                    user_id: 'user_id',
                    value: 'true',
                },
                {
                    category: 'recommended_next_steps',
                    name: 'step_2',
                    user_id: 'user_id',
                    value: 'true',
                },
                {
                    category: 'recommended_next_steps',
                    name: 'step_3',
                    user_id: 'user_id',
                    value: 'true',
                },
            ],
        };

        const wrapper: ShallowWrapper<any, any, NextStepsView> = shallow(
            <NextStepsView {...props}/>,
        );

        wrapper.instance().transitionToFinalScreen = jest.fn();
        wrapper.instance().nextStep(jest.fn(), 'step_1');
        expect(wrapper.instance().transitionToFinalScreen).toBeCalled();
    });
});
