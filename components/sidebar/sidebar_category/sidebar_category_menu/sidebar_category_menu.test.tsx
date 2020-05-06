// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import SidebarCategoryMenu from './sidebar_category_menu';

describe('components/sidebar/sidebar_category/sidebar_category_menu', () => {
    const baseProps = {
        category: {
            id: 'category1',
            team_id: 'team1',
            type: CategoryTypes.CUSTOM,
            display_name: 'custom_category_1',
        },
        currentTeamId: 'team1',
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        isMuted: false,
        onToggle: jest.fn(),
        actions: {
            createCategory: jest.fn(),
            deleteCategory: jest.fn(),
            renameCategory: jest.fn(),
            moveToCategory: jest.fn(),
        },
    };

    test('should match snapshot and contain correct buttons', () => {
        const wrapper = shallowWithIntl(
            <SidebarCategoryMenu {...baseProps}/>
        );

        expect(wrapper.find('#rename-category1')).toHaveLength(1);
        expect(wrapper.find('#createChannel-category1')).toHaveLength(1);
        expect(wrapper.find('#create-category1')).toHaveLength(1);
        expect(wrapper.find('#delete-category1')).toHaveLength(1);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when category is favorites', () => {
        const props = {
            ...baseProps,
            category: {
                ...baseProps.category,
                type: CategoryTypes.FAVORITES,
            },
        };

        const wrapper = shallowWithIntl(
            <SidebarCategoryMenu {...props}/>
        );

        expect(wrapper.find('#rename-category1')).toHaveLength(0);
        expect(wrapper.find('#delete-category1')).toHaveLength(0);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when user does not have permissions', () => {
        const props = {
            ...baseProps,
            canCreatePrivateChannel: false,
            canCreatePublicChannel: false,
        };

        const wrapper = shallowWithIntl(
            <SidebarCategoryMenu {...props}/>
        );

        expect(wrapper.find('#createChannel-category1')).toHaveLength(0);

        expect(wrapper).toMatchSnapshot();
    });
});
