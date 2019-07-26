// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import DotMenu from 'components/dot_menu/dot_menu.jsx';

jest.mock('utils/utils', () => {
    const original = require.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

jest.mock('utils/post_utils', () => {
    const original = require.requireActual('utils/post_utils');
    return {
        ...original,
        isSystemMessage: jest.fn(() => false),
        canEditPost: jest.fn(() => true),
        canDeletePost: jest.fn(() => false),
    };
});

describe('components/dot_menu/DotMenu', () => {
    const baseProps = {
        post: {id: 'post_id_1', is_pinned: false},
        isLicensed: false,
        postEditTimeLimit: '-1',
        handleCommentClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        enableEmojiPicker: true,
        pluginMenuItems: [
            {
                id: 'test_plugin_menu_item_1',
                text: 'woof',
            },
        ],
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
            setEditingPost: jest.fn(),
            pinPost: jest.fn(),
            unpinPost: jest.fn(),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot, no divider or plugin menu items', () => {
        const utils = require('utils/post_utils'); //eslint-disable-line global-require
        utils.canDeletePost.mockReturnValue(true);

        const wrapper = shallowWithIntl(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, render divider and plugin menu item', () => {
        baseProps.pluginMenuItems = [
            {
                id: 'test_plugin_menu_item_1',
                text: 'woof',
            },
        ];

        const wrapper = shallowWithIntl(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance();
        const setStateMock = jest.fn();
        instance.setState = setStateMock;
        wrapper.instance().handleEditDisable();
        expect(setStateMock).toBeCalledWith({canEdit: false});
    });
});
