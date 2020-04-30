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
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        isMuted: false,
        onToggle: jest.fn(),
        actions: {},
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <SidebarCategoryMenu {...baseProps}/>
        );

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

        expect(wrapper).toMatchSnapshot();
    });
});
