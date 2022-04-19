// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import LearnMoreTrialModalStep from 'components/learn_more_trial_modal/learn_more_trial_modal_step';

describe('components/learn_more_trial_modal/learn_more_trial_modal_step', () => {
    const props = {
        id: 'stepId',
        title: 'Step title',
        description: 'Step description',
        svgWrapperClassName: 'stepClassname',
        svgElement: <svg/>,
        buttonLabel: 'button',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <LearnMoreTrialModalStep {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with optional params', () => {
        const wrapper = shallow(
            <LearnMoreTrialModalStep
                {...props}
                bottomLeftMessage='Step bottom message'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
