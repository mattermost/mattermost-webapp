// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {mount, shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import EnableNotificationsStep from './enable_notifications_step';
import {Provider} from 'react-redux';
import testConfigureStore from 'tests/test_configure_store';
import { mountWithIntl } from 'tests/helpers/intl-test-helper';

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
        const store = testConfigureStore();

        const wrapper = mountWithIntl(<Provider store={store}>
            <EnableNotificationsStep {...props}/>
        </Provider>);
        expect(wrapper).toMatchSnapshot();
    });
});
