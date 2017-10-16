// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import PostAddChannelMember from 'components/post_view/post_add_channel_member/post_add_channel_member.jsx';

jest.mock('react-router/es6', () => ({
    browserHistory: {
        push: jest.fn()
    }
}));

describe('components/post_view/PostAddChannelMember', () => {
    const team = {
        id: 'team_id',
        name: 'team_name'
    };
    const channel = {
        id: 'channel_id',
        name: 'channel_name'
    };

    const requiredProps = {
        team,
        channel,
        postId: 'post_id_1',
        userIds: 'user_id_1',
        localizationId: 'post_body.check_for_out_of_channel_mentions.link.public',
        actions: {
            getPost: jest.fn(),
            removePost: jest.fn(),
            addChannelMember: jest.fn()
        }
    };

    test('should match snapshot, public channel', () => {
        const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, private channel', () => {
        const props = {
            ...requiredProps,
            localizationId: 'post_body.check_for_out_of_channel_mentions.link.private'
        };

        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('actions should have been called', () => {
        const post = {
            id: 'post_id_1',
            channel_id: 'channel_id'
        };
        const getPost = jest.fn();
        getPost.mockReturnValueOnce(post);
        const actions = {
            getPost,
            removePost: jest.fn(),
            addChannelMember: jest.fn()
        };
        const props = {...requiredProps, actions};
        const wrapper = mountWithIntl(<PostAddChannelMember {...props}/>);

        wrapper.find('a').simulate('click');

        expect(actions.getPost).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledWith(channel.id, requiredProps.userIds);
        expect(actions.removePost).toHaveBeenCalledTimes(1);
        expect(actions.removePost).toHaveBeenCalledWith(post);
    });

    test('addChannelMember should have been called multiple times', () => {
        const userIds = 'user_id_1-user_id_2-user_id_3-user_id_4';
        const post = {
            id: 'post_id_1',
            channel_id: 'channel_id'
        };
        const getPost = jest.fn();
        getPost.mockReturnValueOnce(post);
        const actions = {
            getPost,
            removePost: jest.fn(),
            addChannelMember: jest.fn()
        };
        const props = {...requiredProps, userIds, actions};
        const wrapper = mountWithIntl(<PostAddChannelMember {...props}/>);

        wrapper.find('a').simulate('click');

        expect(actions.getPost).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledTimes(4);
    });
});
