// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {Locations, PostTypes} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import DotMenu, {PLUGGABLE_COMPONENT} from './dot_menu';

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

describe('components/dot_menu/DotMenu', () => {
    const baseProps = {
        post: TestHelper.getPostMock({id: 'post_id_1', is_pinned: false, type: ''}),
        isLicensed: false,
        postEditTimeLimit: '-1',
        handleCommentClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        enableEmojiPicker: true,
        components: {},
        channelIsArchived: false,
        currentTeamUrl: '',
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
            setEditingPost: jest.fn(),
            pinPost: jest.fn(),
            unpinPost: jest.fn(),
            openModal: jest.fn(),
            markPostAsUnread: jest.fn(),
            doAppCall: jest.fn(),
            postEphemeralCallResponseForPost: jest.fn(),
        },
        canEdit: false,
        canDelete: false,
        appBindings: [],
        pluginMenuItems: [],
        appsEnabled: false,
        isReadOnly: false,
    };

    test('should match snapshot, on Center', () => {
        const props = {
            ...baseProps,
            canEdit: true,
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance();
        const setStateMock = jest.fn();
        instance.setState = setStateMock;
        wrapper.instance().handleEditDisable();
        expect(setStateMock).toBeCalledWith({canEdit: false});
    });

    test('should match snapshot, canDelete', () => {
        const props = {
            ...baseProps,
            canEdit: true,
            canDelete: true,
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have divider when able to edit or delete post', () => {
        const props = {
            ...baseProps,
            canEdit: true,
            canDelete: true,
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
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
            post: TestHelper.getPostMock({
                ...baseProps.post,
                type: PostTypes.JOIN_CHANNEL,
            }),
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
        );

        expect(wrapper.find('#divider_post_post_id_1_edit').exists()).toBe(false);
    });

    test('should have divider when plugin menu item exists', () => {
        const wrapper = shallowWithIntl(
            <DotMenu {...baseProps}/>,
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
        const wrapper = shallowWithIntl(
            <DotMenu {...baseProps}/>,
        );
        expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(false);

        wrapper.setProps({
            components: {
                [PLUGGABLE_COMPONENT]: [{}],
            },
        });
        expect(wrapper.find('#divider_post_post_id_1_plugins').exists()).toBe(true);
    });

    test('should show mark as unread when channel is not archived', () => {
        const wrapper = shallowWithIntl(
            <DotMenu {...baseProps}/>,
        );

        expect(wrapper.find(`#unread_post_${baseProps.post.id}`).prop('show')).toBe(true);
    });

    test('should not show mark as unread when channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
        );

        expect(wrapper.find(`#unread_post_${baseProps.post.id}`).prop('show')).toBe(false);
    });

    test('should not show mark as unread in search', () => {
        const props = {
            ...baseProps,
            location: Locations.SEARCH,
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
        );

        expect(wrapper.find(`#unread_post_${baseProps.post.id}`).prop('show')).toBe(false);
    });
});
