// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {mount, shallow} from 'enzyme';
import React from 'react';

import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {getCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';

import CustomStatusEmoji from './custom_status_emoji';

jest.mock('selectors/views/custom_status', () => {
    const original = jest.requireActual('selectors/views/custom_status');
    return {
        ...original,
        isCustomStatusEnabled: jest.fn(),
        getCustomStatus: jest.fn(),
    };
});

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
        isCustomStatusEnabled.mockReturnValue(false);
        const wrapper = mount(
            <Provider store={store}>
                <CustomStatusEmoji/>
            </Provider>,
        );

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should not render when getCustomStatus returns null', () => {
        isCustomStatusEnabled.mockReturnValue(true);
        getCustomStatus.mockReturnValue(null);
        const wrapper = mount(
            <Provider store={store}>
                <CustomStatusEmoji/>
            </Provider>,
        );

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });
});
