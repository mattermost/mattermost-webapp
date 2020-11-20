// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import FollowButton from 'components/threading/common/follow_button';
import ThreadMenu from 'components/threading/global_threads/thread_menu';

import ThreadPane from './thread_pane';

describe('components/threading/global_threads/thread_header', () => {
    let props: ComponentProps<typeof ThreadPane>;

    beforeEach(() => {
        props = {
            isFollowing: false,
            isSaved: false,
            channelName: 'This is a channel name',
            hasUnreads: false,
            actions: {
                follow: jest.fn(),
                unFollow: jest.fn(),
                openInChannel: jest.fn(),
                markRead: jest.fn(),
                markUnread: jest.fn(),
                save: jest.fn(),
                unSave: jest.fn(),
                copyLink: jest.fn(),
            },
        };
    });

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <ThreadPane {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should support follow', () => {
        const wrapper = mountWithIntl(
            <ThreadPane {...props}/>,
        );

        wrapper.find(FollowButton).find('button').simulate('click');
        expect(props.actions.follow).toHaveBeenCalled();
    });
    test('should support unfollow', () => {
        props.isFollowing = true;
        const wrapper = mountWithIntl(
            <ThreadPane {...props}/>,
        );

        wrapper.find(FollowButton).find('button').simulate('click');
        expect(props.actions.unFollow).toHaveBeenCalled();
    });

    test('should support openInChannel', () => {
        props.isFollowing = true;
        const wrapper = mountWithIntl(
            <ThreadPane {...props}/>,
        );

        wrapper.find('h3 button').simulate('click');
        expect(props.actions.openInChannel).toHaveBeenCalled();
    });

    test('should pass required props to ThreadMenu', () => {
        const wrapper = mountWithIntl(
            <ThreadPane
                {...props}
            />,
        );
        const {actions} = props;

        // verify ThreadMenu received transient/required props
        new Map<string, any>([
            ['hasUnreads', props.hasUnreads],
            ['isFollowing', props.isFollowing],
            ['isSaved', props.isSaved],
            ['actions.follow', actions.follow],
            ['actions.unFollow', actions.unFollow],
            ['actions.openInChannel', actions.openInChannel],
            ['actions.markRead', actions.markRead],
            ['actions.markUnread', actions.markUnread],
            ['actions.save', actions.save],
            ['actions.unSave', actions.unSave],
            ['actions.copyLink', actions.copyLink],
        ]).forEach((val, prop) => {
            expect(wrapper.find(ThreadMenu).props()).toHaveProperty(prop, val);
        });
    });
});

