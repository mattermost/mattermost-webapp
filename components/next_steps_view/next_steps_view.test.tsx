// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import NextStepsView from 'components/next_steps_view/next_steps_view';
import {TestHelper} from 'utils/test_helper';

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
});
