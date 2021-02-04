// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {mount, shallow} from 'enzyme';
import React from 'react';

import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import * as CustomStatusSelectors from 'selectors/views/custom_status';

import CustomStatusEmoji from './custom_status_emoji';

jest.mock('selectors/views/custom_status');

describe('components/custom_status/custom_status_emoji', () => {
    const mockStore = configureStore();
    const store = mockStore({});

    it('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusEmoji/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with props', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusEmoji
                    emojiSize={34}
                    showTooltip={true}
                    tooltipDirection='bottom'
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should not render when EnableCustomStatus in config is false', () => {
        (CustomStatusSelectors.isCustomStatusEnabled as jest.Mock).mockReturnValue(false);
        const wrapper = mount(
            <Provider store={store}>
                <CustomStatusEmoji/>
            </Provider>,
        );

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should not render when getCustomStatus returns null', () => {
        (CustomStatusSelectors.isCustomStatusEnabled as jest.Mock).mockReturnValue(true);
        (CustomStatusSelectors.getCustomStatus as jest.Mock).mockReturnValue(null);
        const wrapper = mount(
            <Provider store={store}>
                <CustomStatusEmoji/>
            </Provider>,
        );

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });
});
