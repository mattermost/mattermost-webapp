// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow, mount} from 'enzyme';
import React from 'react';

import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import * as CustomStatusSelectors from 'selectors/views/custom_status';

import CustomStatusText from './custom_status_text';

jest.mock('selectors/views/custom_status');

describe('components/custom_status/custom_status_text', () => {
    const mockStore = configureStore();
    const store = mockStore({});

    it('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusText/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with props', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusText
                    tooltipDirection='top'
                    text='In a meeting'
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should not render when EnableCustomStatus in config is false', () => {
        (CustomStatusSelectors.isCustomStatusEnabled as jest.Mock).mockReturnValue(false);
        const wrapper = mount(
            <Provider store={store}>
                <CustomStatusText/>
            </Provider>,
        );

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });
});
