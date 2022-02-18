// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useHistory} from 'react-router-dom';

import {shallow} from 'enzyme';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import LearnMoreTrialModalStepMore from 'components/learn_more_trial_modal/start_trial_btn';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

jest.mock('react-router-dom', () => {
    const original = jest.requireActual('react-router-dom');

    return {
        ...original,
        useHistory: jest.fn().mockReturnValue({
            push: jest.fn(),
        }),
    };
});

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');
    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

describe('components/learn_more_trial_modal/start_trial_btn', () => {
    const props = {
        id: 'thing',
        route: '/test/page',
        message: 'Test Message',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <LearnMoreTrialModalStepMore {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should handle on click', () => {
        const mockHistory = useHistory();
        const mockOnClick = jest.fn();

        const wrapper = shallow(
            <LearnMoreTrialModalStepMore
                {...props}
                onClick={mockOnClick}
            />,
        );

        wrapper.find('.learn-more-button').simulate('click');

        expect(mockHistory.push).toHaveBeenCalledWith(props.route);
        expect(mockOnClick).toHaveBeenCalled();
        expect(trackEvent).toHaveBeenCalledWith(TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL, 'learn_more_trial_modal_section_opened_thing');
    });
});
