// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {Locations, PostTypes} from 'utils/constants';

import DotMenu, {PLUGGABLE_COMPONENT} from './dot_menu';

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
        canEditPost: jest.fn(() => true),
        canDeletePost: jest.fn(() => false),
    };
});

describe('components/dot_menu/DotMenu', () => {
    const baseProps = {
        post: {id: 'post_id_1', is_pinned: false, type: ''},
        isLicensed: false,
        postEditTimeLimit: '-1',
        handleCommentClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        enableEmojiPicker: true,
        components: {},
        channelIsArchived: false,
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
            setEditingPost: jest.fn(),
            pinPost: jest.fn(),
            unpinPost: jest.fn(),
            openModal: jest.fn(),
            markPostAsUnread: jest.fn(),
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

    test('should have divider when able to edit or delete post', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );
        expect(wrapper.state('canEdit')).toBe(true);
        expect(wrapper.state('canDelete')).toBe(true);
        expect(wrapper.find('#divider_post_post_id_1_edit').exists()).toBe(true);

        wrapper.setProps({isReadOnly: true});

        expect(wrapper.state('canEdit')).toBe(false);
        expect(wrapper.state('canDelete')).toBe(false);
        expect(wrapper.find('#divider_post_post_id_1_edit').exists()).toBe(false);
    });

    test('should not have divider when able to edit or delete a system message', () => {
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                type: PostTypes.JOIN_CHANNEL,
            },
        };
        const wrapper = shallow(
            <DotMenu {...props}/>
        );

        expect(wrapper.find('#divider_post_post_id_1_edit').exists()).toBe(false);
    });

    test('should have divider when plugin menu item exists', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );
        expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(false);

        wrapper.setProps({
            pluginMenuItems: [
                {id: 'test_plugin_menu_item_1', text: 'woof'},
            ],
        });
        expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(true);
    });

    test('should have divider when pluggable menu item exists', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );
        expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(false);

        wrapper.setProps({
            components: {
                [PLUGGABLE_COMPONENT]: {},
            },
        });
        expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(true);
    });

    test('should show mark as unread when channel is not archived', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper.find(`#unread_post_${baseProps.post.id}`).prop('show')).toBe(true);
    });

    test('should not show mark as unread when channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };
        const wrapper = shallow(
            <DotMenu {...props}/>
        );

        expect(wrapper.find(`#unread_post_${baseProps.post.id}`).prop('show')).toBe(false);
    });

    test('should not show mark as unread in search', () => {
        const props = {
            ...baseProps,
            location: Locations.SEARCH,
        };
        const wrapper = shallow(
            <DotMenu {...props}/>
        );

        expect(wrapper.find(`#unread_post_${baseProps.post.id}`).prop('show')).toBe(false);
    });
});
