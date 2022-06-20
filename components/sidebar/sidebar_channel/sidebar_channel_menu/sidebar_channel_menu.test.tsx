// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import * as reactRedux from 'react-redux';
import configureStore from 'redux-mock-store';

import {TestHelper} from 'utils/test_helper';

import SidebarChannelMenu from './sidebar_channel_menu';

describe('components/sidebar/sidebar_channel/sidebar_channel_menu', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
    const mockStore = configureStore();

    beforeEach(() => {
        useDispatchMock.mockClear();
        useSelectorMock.mockClear();
    });

    const testChannel = TestHelper.getChannelMock();

    const baseProps = {
        channel: testChannel,
        channelLink: 'http://a.fake.link',
        location: 'sidebar',
    };

    test('should match snapshot and contain correct buttons', () => {
        const state = {};
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);

        const wrapper = shallow(
            <reactRedux.Provider store={store}><SidebarChannelMenu {...baseProps}/></reactRedux.Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
