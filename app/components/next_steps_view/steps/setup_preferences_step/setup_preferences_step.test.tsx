// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import configureStore from 'redux-mock-store';

import {Provider} from 'react-redux';

import {TestHelper} from 'utils/test_helper';

import SetupPreferencesStep from './setup_preferences_step';

describe('components/next_steps_view/steps/setup_preferences_step', () => {
    const initialState = {};
    const mockStore = configureStore();
    const props = {
        id: 'test',
        currentUser: TestHelper.getUserMock(),
        expanded: true,
        isAdmin: false,
        onSkip: () => { },
        onFinish: () => {},
    };

    test('should match snapshot', () => {
        const store = mockStore(initialState);
        const wrapper = shallow(
            <Provider store={store}>
                <SetupPreferencesStep {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
