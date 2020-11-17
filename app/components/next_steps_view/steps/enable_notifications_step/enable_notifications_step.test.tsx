// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import EnableNotificationsStep from './enable_notifications_step';

describe('components/next_steps_view/steps/setup_preferences_step', () => {
    const props = {
        id: 'test',
        currentUser: TestHelper.getUserMock(),
        expanded: true,
        isAdmin: false,
        onSkip: () => {},
        onFinish: () => {},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<EnableNotificationsStep {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
