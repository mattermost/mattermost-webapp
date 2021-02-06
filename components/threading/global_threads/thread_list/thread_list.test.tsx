// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ThreadList from './thread_list';

describe('components/threading/global_threads/thread_list', () => {
    let props: ComponentProps<typeof ThreadList>;

    beforeEach(() => {
        props = {
            currentFilter: '',
            someUnread: true,
            markAllRead: jest.fn(),
            setFilter: jest.fn(),
        };
    });

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <ThreadList {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should support markAllRead', () => {
        const wrapper = mountWithIntl(
            <ThreadList {...props}/>,
        );

        wrapper.find('.icon-playlist-check').simulate('click');
        expect(props.actions.markAllRead).toHaveBeenCalled();
    });

    test('should support filter:all', () => {
        const wrapper = mountWithIntl(
            <ThreadList {...props}/>,
        );

        wrapper.find('button').first().simulate('click');
        expect(props.actions.setFilter).toHaveBeenCalledWith('');
    });

    test('should support filter:unread', () => {
        const wrapper = mountWithIntl(
            <ThreadList {...props}/>,
        );

        wrapper.find('button .dot').simulate('click');
        expect(props.actions.setFilter).toHaveBeenCalledWith('unread');
    });
});

