// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

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
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
            setEditingPost: jest.fn(),
            pinPost: jest.fn(),
            unpinPost: jest.fn(),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot, on Center', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance();
        const setStateMock = jest.fn();
        instance.setState = setStateMock;
        wrapper.instance().handleEditDisable();
        expect(setStateMock).toBeCalledWith({canEdit: false});
    });

    test('should match snapshot, canDelete', () => {
        const utils = require('utils/post_utils'); //eslint-disable-line global-require
        utils.canDeletePost.mockReturnValue(true);

        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have divider when plugin menu item exists', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper.find('#divider_post_post_id_1').exists()).toBe(false);

        wrapper.setProps({pluginMenuItems: [{id: 'test_plugin_menu_item_1', text: 'woof'}]});
        expect(wrapper.find('#divider_post_post_id_1').length).toBe(1);
    });
});
