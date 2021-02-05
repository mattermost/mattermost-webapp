// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {shallow} from 'enzyme';

import {setThreadFollow} from 'mattermost-redux/actions/threads';
jest.mock('mattermost-redux/actions/threads');

import Header from 'components/widgets/header';

import FollowButton from 'components/threading/common/follow_button';
import Button from 'components/threading/common/button';

import ThreadPane from './thread_pane';

const mockRouting = {
    currentUserId: 'uid',
    currentTeamId: 'tid',
    goToInChannel: jest.fn(),
};
jest.mock('../../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: () => '',
    useDispatch: () => mockDispatch,
}));

describe('components/threading/global_threads/thread_header', () => {
    let props: ComponentProps<typeof ThreadPane>;
    let mockThread: typeof props['thread'];

    beforeEach(() => {
        mockThread = {
            id: '1y8hpek81byspd4enyk9mp1ncw',
            unread_replies: 0,
            unread_mentions: 0,
            is_following: true,
            post: {
                id: '1y8hpek81byspd4enyk9mp1ncw',
                user_id: 'mt5td9mdriyapmwuh5pc84dmhr',
                channel_id: 'sqgmq95ewirszjiep6rsuu5kpr',
                create_at: 1610486901110,
                edit_at: 1611786714912,
            },
        } as typeof props['thread'];

        props = {
            thread: mockThread,
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ThreadPane {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should support follow', () => {
        props.thread.is_following = false;
        const wrapper = shallow(
            <ThreadPane {...props}/>,
        );
        wrapper.find(Header).shallow().find(FollowButton).shallow().simulate('click');
        expect(setThreadFollow).toHaveBeenCalledWith(mockRouting.currentUserId, mockRouting.currentTeamId, mockThread.id, true);
        expect(mockDispatch).toHaveBeenCalled();
    });
    test('should support unfollow', () => {
        props.thread.is_following = true;
        const wrapper = shallow(
            <ThreadPane {...props}/>,
        );

        wrapper.find(Header).shallow().find(FollowButton).shallow().simulate('click');
        expect(setThreadFollow).toHaveBeenCalledWith(mockRouting.currentUserId, mockRouting.currentTeamId, mockThread.id, false);
        expect(mockDispatch).toHaveBeenCalled();
    });

    test('should support openInChannel', () => {
        const wrapper = shallow(
            <ThreadPane {...props}/>,
        );

        wrapper.find(Header).shallow().find('h3').find(Button).simulate('click');
        expect(mockRouting.goToInChannel).toHaveBeenCalledWith('1y8hpek81byspd4enyk9mp1ncw');
    });
});

