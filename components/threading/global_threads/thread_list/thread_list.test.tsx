// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {shallow} from 'enzyme';

import {getThreads, markAllThreadsInTeamRead} from 'mattermost-redux/actions/threads';
jest.mock('mattermost-redux/actions/threads');

import Header from 'components/widgets/header';

import {Constants} from 'utils/constants';

import Button from '../../common/button';

import ThreadList, {ThreadFilter} from './thread_list';
import VirtualizedThreadList from './virtualized_thread_list';

const mockRouting = {
    currentUserId: 'uid',
    currentTeamId: 'tid',
    goToInChannel: jest.fn(),
    select: jest.fn(),
};
jest.mock('../../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const mockDispatch = jest.fn();
let mockState: any;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/threading/global_threads/thread_list', () => {
    let props: ComponentProps<typeof ThreadList>;

    beforeEach(() => {
        props = {
            currentFilter: ThreadFilter.none,
            someUnread: true,
            ids: ['1', '2', '3'],
            unreadIds: ['2'],
            setFilter: jest.fn(),
        };

        mockState = {
            entities: {
                threads: {
                    countsIncludingDirect: {
                        tid: {
                            total: 0,
                            total_unread_threads: 0,
                            total_unread_mentions: 0,
                        },
                    },
                },
                teams: {
                    currentTeamId: 'tid',
                },
            },
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ThreadList {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should support filter:all', () => {
        const wrapper = shallow(
            <ThreadList {...props}/>,
        );

        wrapper.find(Header).shallow().find(Button).first().shallow().simulate('click');
        expect(props.setFilter).toHaveBeenCalledWith('');
    });

    test('should support filter:unread', () => {
        const wrapper = shallow(
            <ThreadList {...props}/>,
        );

        wrapper.find(Header).shallow().find(Button).find({hasDot: true}).simulate('click');
        expect(props.setFilter).toHaveBeenCalledWith('unread');
    });

    test('should support markAllThreadsInTeamRead', () => {
        const wrapper = shallow(
            <ThreadList {...props}/>,
        );

        wrapper.find(Header).shallow().find({content: 'Mark all as read'}).find(Button).simulate('click');
        expect(markAllThreadsInTeamRead).toHaveBeenCalledWith('uid', 'tid');
    });

    test('should support getThreads', async () => {
        const setState = jest.fn();
        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation((init = false) => [init, setState]);

        const wrapper = shallow(
            <ThreadList {...props}/>,
        );

        const handleLoadMoreItems = wrapper.find(VirtualizedThreadList).prop('loadMoreItems');
        const loadMoreItems = await handleLoadMoreItems(2, 3);

        expect(loadMoreItems).toEqual({data: true});
        expect(getThreads).toHaveBeenCalledWith('uid', 'tid', {unread: false, perPage: Constants.THREADS_PAGE_SIZE, before: '2'});
        expect(setState.mock.calls).toEqual([[true], [false], [true]]);
    });
});
