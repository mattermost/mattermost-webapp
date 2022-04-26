// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import * as redux from 'react-redux';
import configureStore from 'redux-mock-store';

import {shallow} from 'enzyme';

import Insights from './insights';

describe('components/activity_and_insights/insights', () => {
    const mockStore = configureStore();
    const store = mockStore({});

    test('should match snapshot', () => {
        const wrapper = shallow(
            <redux.Provider store={store}>
                <Insights/>
            </redux.Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
