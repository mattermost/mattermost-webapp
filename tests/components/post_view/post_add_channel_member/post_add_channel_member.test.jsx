// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';
import {shallow} from 'enzyme';

import store from 'stores/redux_store.jsx';
import {sendAddToChannelEphemeralPost} from 'actions/global_actions.jsx';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import PostAddChannelMember from 'components/post_view/post_add_channel_member/post_add_channel_member.jsx';

jest.mock('actions/global_actions.jsx', () => {
    return {
        sendAddToChannelEphemeralPost: jest.fn(),
    };
});

describe('components/post_view/PostAddChannelMember', () => {
    const requiredProps = {
        currentUser: {id: 'current_user_id', username: 'current_username'},
        channelType: 'O',
        postId: 'post_id_1',
        userIds: ['user_id_1'],
        usernames: ['username_1'],
        hasMention: false,
        actions: {
            getPost: jest.fn(),
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
        },
    };

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
        const post = {
            id: 'post_id_1',
            root_id: 'root_id',
            channel_id: 'channel_id',
        };
        const getPost = jest.fn();
        getPost.mockReturnValueOnce(post);
        const actions = {
            getPost,
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
        };
        const props = {...requiredProps, actions};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostAddChannelMember {...props}/>
            </Provider>
        );

        wrapper.find('a').simulate('click');

        expect(actions.getPost).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledWith(post.channel_id, requiredProps.userIds[0]);
        expect(sendAddToChannelEphemeralPost).toHaveBeenCalledTimes(1);
        expect(sendAddToChannelEphemeralPost).toHaveBeenCalledWith(props.currentUser, props.usernames[0], post.channel_id, post.root_id);
        expect(actions.removePost).toHaveBeenCalledTimes(1);
        expect(actions.removePost).toHaveBeenCalledWith(post);
    });

    test('addChannelMember should have been called multiple times', () => {
        const userIds = ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'];
        const usernames = ['username_1', 'username_2', 'username_3', 'username_4'];
        const post = {
            id: 'post_id_1',
            channel_id: 'channel_id',
        };
        const getPost = jest.fn();
        getPost.mockReturnValueOnce(post);
        const actions = {
            getPost,
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
        };
        const props = {...requiredProps, userIds, usernames, actions};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostAddChannelMember {...props}/>
            </Provider>
        );

        wrapper.find('a').simulate('click');

        expect(actions.getPost).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledTimes(4);
    });
});
