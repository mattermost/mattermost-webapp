// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {sendAddToChannelEphemeralPost} from 'actions/global_actions.jsx';
import PostAddChannelMember from 'components/post_view/post_add_channel_member/post_add_channel_member.jsx';

jest.mock('actions/global_actions.jsx', () => {
    return {
        sendAddToChannelEphemeralPost: jest.fn(),
    };
});

describe('components/post_view/PostAddChannelMember', () => {
    const post = {
        id: 'post_id_1',
        root_id: 'root_id',
        channel_id: 'channel_id',
        create_at: 1,
    };
    const requiredProps = {
        currentUser: {id: 'current_user_id', username: 'current_username'},
        channelType: 'O',
        postId: 'post_id_1',
        post,
        userIds: ['user_id_1'],
        usernames: ['username_1'],
        hasMention: false,
        actions: {
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
        },
        noGroupsUsernames: [],
    };

    test('should match snapshot, empty postId', () => {
        const props = {
            ...requiredProps,
            postId: '',
        };
        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, empty channelType', () => {
        const props = {
            ...requiredProps,
            channelType: '',
        };
        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, public channel', () => {
        const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, private channel', () => {
        const props = {
            ...requiredProps,
            channelType: 'P',
        };

        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('actions should have been called', () => {
        const actions = {
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
        };
        const props = {...requiredProps, actions};
        const wrapper = shallow(
            <PostAddChannelMember {...props}/>
        );

        wrapper.find('a').simulate('click');

        expect(actions.addChannelMember).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledWith(post.channel_id, requiredProps.userIds[0]);
        expect(sendAddToChannelEphemeralPost).toHaveBeenCalledTimes(1);
        expect(sendAddToChannelEphemeralPost).toHaveBeenCalledWith(props.currentUser, props.usernames[0], props.userIds[0], post.channel_id, post.root_id, 2);
        expect(actions.removePost).toHaveBeenCalledTimes(1);
        expect(actions.removePost).toHaveBeenCalledWith(post);
    });

    test('addChannelMember should have been called multiple times', () => {
        const userIds = ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'];
        const usernames = ['username_1', 'username_2', 'username_3', 'username_4'];
        const actions = {
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
        };
        const props = {...requiredProps, userIds, usernames, actions};
        const wrapper = shallow(
            <PostAddChannelMember {...props}/>
        );

        wrapper.find('a').simulate('click');
        expect(actions.addChannelMember).toHaveBeenCalledTimes(4);
    });

    test('should match snapshot, with no-groups usernames', () => {
        const props = {
            ...requiredProps,
            noGroupsUsernames: ['user_id_2'],
        };
        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
