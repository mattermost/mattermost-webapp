// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ThreadList from './thread_list';

describe('components/threading/global_threads/thread_list', () => {
    let listProps: ComponentProps<typeof ThreadList>;

    beforeEach(() => {
        listProps = {
            currentFilter: '',
            someUnread: true,
            actions: {
                markAllRead: jest.fn(),
                setFilter: jest.fn(),
            },
        };
    });

    test('should report total number of replies', () => {
        const wrapper = mountWithIntl(
            <ThreadList {...listProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});

