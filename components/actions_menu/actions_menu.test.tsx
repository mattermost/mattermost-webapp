// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PostType} from 'mattermost-redux/types/posts';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {TestHelper} from 'utils/test_helper';

// import ActionsMenu, {PLUGGABLE_COMPONENT} from './actions_menu';
import ActionsMenu from './actions_menu';

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

describe('components/actions_menu/ActionsMenu', () => {
    const baseProps = {
        appBindings: [],
        appsEnabled: false,
        handleDropdownOpened: jest.fn(),
        isMenuOpen: true,
        isSysAdmin: true,
        pluginMenuItems: [],
        post: TestHelper.getPostMock({id: 'post_id_1', is_pinned: false, type: '' as PostType}),
        showTutorialTip: false,
        components: {},
        actions: {
            doAppCall: jest.fn(),
            openModal: jest.fn(),
            postEphemeralCallResponseForPost: jest.fn(),
        },
    };

    // test('should have divider when plugin menu item exists', () => {
    //     const wrapper = shallowWithIntl(
    //         <ActionsMenu {...baseProps}/>,
    //     );
    //     expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(false);
    //
    //     wrapper.setProps({
    //         pluginMenuItems: [
    //             {id: 'test_plugin_menu_item_1', text: 'woof'},
    //         ],
    //     });
    //     expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(true);
    // });

    test('actions menu should be visible to sysadmin', () => {
        const wrapper = shallowWithIntl(
            <ActionsMenu {...baseProps}/>,
        );
        expect(wrapper.find('#CENTER_button_post_id_1').exists()).toBe(true);
    });

    test('actions menu should not be visible to end user', () => {
        const wrapper = shallowWithIntl(
            <ActionsMenu {...baseProps}/>,
        );
        wrapper.setProps({
            isSysAdmin: false,
        });
        expect(wrapper.find('#CENTER_button_post_id_1').exists()).toBe(false);
    });

    // test('should have divider when pluggable menu item exists', () => {
    //     const wrapper = shallowWithIntl(
    //         <ActionsMenu {...baseProps}/>,
    //     );
    //     expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(false);
    //
    //     wrapper.setProps({
    //         components: {
    //             [PLUGGABLE_COMPONENT]: [{}],
    //         },
    //     });
    //     expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(true);
    // });
});
