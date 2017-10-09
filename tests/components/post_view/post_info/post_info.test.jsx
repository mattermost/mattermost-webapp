// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import {Posts} from 'mattermost-redux/constants';

import Constants from 'utils/constants.jsx';

import PostInfo from 'components/post_view/post_info/post_info.jsx';

describe('components/post_view/PostInfo', () => {
    global.window.mm_config = {};

    const post = {
        channel_id: 'g6139tbospd18cmxroesdk3kkc',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        hashtags: '',
        id: 'e584uzbwwpny9kengqayx5ayzw',
        is_pinned: false,
        message: 'post message',
        original_id: '',
        parent_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: '',
        update_at: 1502715372443,
        user_id: 'b4pfxi8sn78y8yq7phzxxfor7h'
    };

    const requiredProps = {
        post,
        handleCommentClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        compactDisplay: false,
        lastPostCount: 0,
        replyCount: 0,
        getPostList: jest.fn(),
        useMilitaryTime: false,
        isFlagged: false,
        actions: {
            removePost: jest.fn(),
            addReaction: jest.fn()
        }
    };

    afterEach(() => {
        global.window.mm_config = {};
    });

    beforeEach(() => {
        global.window.mm_config.EnableEmojiPicker = 'false';
    });

    test('should match snapshot', () => {
        const wrapper = shallow(<PostInfo {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, compact display', () => {
        const props = {...requiredProps, compactDisplay: true};

        const wrapper = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, military time', () => {
        const props = {...requiredProps, useMilitaryTime: true};

        const wrapper = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, flagged post', () => {
        const props = {...requiredProps, isFlagged: true};

        const wrapper = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, pinned post', () => {
        const pinnedPost = {...post, is_pinned: true};
        const requiredPropsWithPinnedPost = {...requiredProps, post: pinnedPost};

        const wrapper = shallow(<PostInfo {...requiredPropsWithPinnedPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, ephemeral post', () => {
        const ephemeralPost = {...post, type: Constants.PostTypes.EPHEMERAL};
        const requiredPropsWithEphemeralPost = {...requiredProps, post: ephemeralPost};

        const wrapper = shallow(<PostInfo {...requiredPropsWithEphemeralPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, ephemeral deleted post', () => {
        const deletedEphemeralPost = {...post, type: Constants.PostTypes.EPHEMERAL, state: Posts.POST_DELETED};
        const requiredPropsWithDeletedEphemeralPost = {...requiredProps, post: deletedEphemeralPost};

        const wrapper = shallow(<PostInfo {...requiredPropsWithDeletedEphemeralPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enable emoji picker', () => {
        global.window.mm_config.EnableEmojiPicker = 'true';

        const wrapper = shallow(<PostInfo {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('toggleEmojiPicker, should have called props.handleDropdownOpened', () => {
        global.window.mm_config.EnableEmojiPicker = 'true';

        const handleDropdownOpened = jest.fn();
        const requiredPropsWithHandleDropdownOpened = {...requiredProps, handleDropdownOpened};

        const wrapper = shallow(<PostInfo {...requiredPropsWithHandleDropdownOpened}/>);
        wrapper.instance().toggleEmojiPicker();
        expect(wrapper).toMatchSnapshot();
        expect(handleDropdownOpened).toHaveBeenCalledTimes(1);
    });

    test('hideEmojiPicker, should have called props.handleDropdownOpened(false)', () => {
        global.window.mm_config.EnableEmojiPicker = 'true';

        const handleDropdownOpened = jest.fn();
        const requiredPropsWithHandleDropdownOpened = {...requiredProps, handleDropdownOpened};

        const wrapper = shallow(<PostInfo {...requiredPropsWithHandleDropdownOpened}/>);
        wrapper.instance().hideEmojiPicker();
        expect(wrapper).toMatchSnapshot();
        expect(handleDropdownOpened).toHaveBeenCalledTimes(1);
        expect(handleDropdownOpened).toBeCalledWith(false);
    });

    test('removePost, should have called props.actions.removePost(post)', () => {
        global.window.mm_config.EnableEmojiPicker = 'true';

        const removePost = jest.fn();
        const actions = {
            removePost,
            addReaction: jest.fn()
        };
        const requiredPropsWithRemovePost = {...requiredProps, actions};

        const wrapper = shallow(<PostInfo {...requiredPropsWithRemovePost}/>);
        wrapper.instance().removePost();
        expect(wrapper).toMatchSnapshot();
        expect(removePost).toHaveBeenCalledTimes(1);
        expect(removePost).toBeCalledWith(post);
    });

    test('reactEmojiClick, should have called props.actions.addReaction()', () => {
        global.window.mm_config.EnableEmojiPicker = 'true';

        const emoji = {name: 'name'};
        const addReaction = jest.fn();
        const actions = {
            removePost: jest.fn(),
            addReaction
        };

        const handleDropdownOpened = jest.fn();
        const requiredPropsWithAddReaction = {...requiredProps, actions, handleDropdownOpened};

        const wrapper = shallow(<PostInfo {...requiredPropsWithAddReaction}/>);
        wrapper.instance().reactEmojiClick(emoji);
        expect(wrapper).toMatchSnapshot();
        expect(addReaction).toHaveBeenCalledTimes(1);
        expect(addReaction).toBeCalledWith(post.id, emoji.name);
        expect(handleDropdownOpened).toHaveBeenCalledTimes(1);
        expect(handleDropdownOpened).toBeCalledWith(false);
    });
});
