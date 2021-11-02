// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import CreateFirstChannelStep from './create_first_channel_step';

describe('components/next_steps_view/steps/create_channel_step', () => {
    const props = {
        id: 'test',
        currentUser: TestHelper.getUserMock(),
        expanded: true,
        isAdmin: false,
        onSkip: () => {},
        onFinish: () => {},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<CreateFirstChannelStep {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
