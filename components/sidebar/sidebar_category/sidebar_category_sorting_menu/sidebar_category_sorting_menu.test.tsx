// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import {Provider} from 'react-redux';

import {TestHelper} from 'utils/test_helper';
import Constants from 'utils/constants';

import mockStore from 'tests/test_store';

import SidebarCategorySortingMenu from './sidebar_category_sorting_menu';

describe('components/sidebar/sidebar_category/sidebar_category_sorting_menu', () => {
    const initialState = {
        views: {
            channelSidebar: {
                draggingState: {
                    state: '',
                    type: '',
                    id: '',
                },
            },
        },
    };

    const baseProps = {
        category: TestHelper.getCategoryMock(),
        handleOpenDirectMessagesModal: jest.fn(),
        isCollapsed: false,
        isMenuOpen: true,
        onToggleMenu: jest.fn(),
        selectedDmNumber: Constants.DM_AND_GM_SHOW_COUNTS[0],
        currentUserId: TestHelper.getUserMock().id,
        setCategorySorting: jest.fn(),
        savePreferences: jest.fn(),
    };

    test('should match snapshot', () => {
        const store = mockStore(initialState);

        const wrapper = mount(
            <Provider store={store}>
                <SidebarCategorySortingMenu {...baseProps}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
