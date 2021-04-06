// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import ThreadMenu from '../thread_menu';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';

describe('components/threading/common/thread_menu', () => {
    let props: ComponentProps<typeof ThreadMenu>;

    beforeEach(() => {
        props = {
            hasUnreads: false,
            isFollowing: false,
            isSaved: false,
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
            <ThreadMenu
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot after opening', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
            />,
        );
        wrapper.find('button').simulate('click');
        expect(wrapper).toMatchSnapshot();
    });

    test('should allow following', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
                isFollowing={false}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.follow}).simulate('click');
        expect(props.actions.follow).toHaveBeenCalled();
    });

    test('should allow unfollowing', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
                isFollowing={true}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.unFollow}).simulate('click');
        expect(props.actions.unFollow).toHaveBeenCalled();
    });

    test('should allow opening in channel', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.openInChannel}).simulate('click');
        expect(props.actions.openInChannel).toHaveBeenCalled();
    });

    test('should allow marking as read', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
                hasUnreads={true}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.markRead}).simulate('click');
        expect(props.actions.markRead).toHaveBeenCalled();
    });

    test('should allow marking as unread', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
                hasUnreads={false}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.markUnread}).simulate('click');
        expect(props.actions.markUnread).toHaveBeenCalled();
    });

    test('should allow saving', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
                isSaved={false}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.save}).simulate('click');
        expect(props.actions.save).toHaveBeenCalled();
    });
    test('should allow unsaving', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
                isSaved={true}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.unSave}).simulate('click');
        expect(props.actions.unSave).toHaveBeenCalled();
    });

    test('should allow link copying', () => {
        const wrapper = mountWithIntl(
            <ThreadMenu
                {...props}
            />,
        );
        wrapper.find('button').simulate('click');
        wrapper.find('button').find({onClick: props.actions.copyLink}).simulate('click');
        expect(props.actions.copyLink).toHaveBeenCalled();
    });
});

