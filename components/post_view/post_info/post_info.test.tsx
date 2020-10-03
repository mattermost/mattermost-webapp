// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import {Posts} from 'mattermost-redux/constants';

import {Post, PostType} from 'mattermost-redux/types/posts';

import PostInfo from 'components/post_view/post_info/post_info';

import Constants from 'utils/constants';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import {TestHelper} from 'utils/test_helper';

describe('components/post_view/PostInfo', () => {
    const post: Post = TestHelper.getPostMock({
        channel_id: 'g6139tbospd18cmxroesdk3kkc',
        create_at: 1502715365009,
        edit_at: 1502715372443,
        id: 'e584uzbwwpny9kengqayx5ayzw',
        type: undefined,
        update_at: 1502715372443,
        user_id: 'b4pfxi8sn78y8yq7phzxxfor7h',
    });

    const requiredProps = {
        post,
        handleCommentClick: jest.fn(),
        handleCardClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        compactDisplay: false,
        replyCount: 0,
        useMilitaryTime: false,
        isFlagged: false,
        hover: false,
        showTimeWithoutHover: false,
        enableEmojiPicker: false,
        shortcutReactToLastPostEmittedFrom: '',
        actions: {
            removePost: jest.fn(),
        },
        shouldShowDotMenu: true,
        isReadOnly: true,
    };

    test('should match snapshot', () => {
        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, compact display', () => {
        const props = {...requiredProps, compactDisplay: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, military time', () => {
        const props = {...requiredProps, useMilitaryTime: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, flagged post', () => {
        const props = {...requiredProps, isFlagged: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, pinned post', () => {
        const pinnedPost = {...post, is_pinned: true};
        const requiredPropsWithPinnedPost = {...requiredProps, post: pinnedPost};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredPropsWithPinnedPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, ephemeral post', () => {
        const ephemeralPost = {...post, type: Constants.PostTypes.EPHEMERAL as PostType};
        const requiredPropsWithEphemeralPost = {...requiredProps, post: ephemeralPost};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredPropsWithEphemeralPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, deleted post', () => {
        const deletedPost = {...post, state: Posts.POST_DELETED as any};
        const requiredPropsWithDeletedPost = {...requiredProps, post: deletedPost};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredPropsWithDeletedPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, ephemeral deleted post', () => {
        const deletedEphemeralPost = {...post, type: Constants.PostTypes.EPHEMERAL as PostType, state: Posts.POST_DELETED as any};
        const requiredPropsWithDeletedEphemeralPost = {...requiredProps, post: deletedEphemeralPost};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredPropsWithDeletedEphemeralPost}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enable emoji picker', () => {
        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(
            <PostInfo
                {...requiredProps}
                enableEmojiPicker={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('toggleEmojiPicker, should have called props.handleDropdownOpened', () => {
        const handleDropdownOpened = jest.fn();
        const requiredPropsWithHandleDropdownOpened = {...requiredProps, handleDropdownOpened, enableEmojiPicker: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredPropsWithHandleDropdownOpened}/>);
        (wrapper.instance() as PostInfo).toggleEmojiPicker();
        expect(wrapper).toMatchSnapshot();
        expect(handleDropdownOpened).toHaveBeenCalledTimes(1);
    });

    test('removePost, should have called props.actions.removePost(post)', () => {
        const removePost = jest.fn();
        const actions = {
            removePost,
        };
        const requiredPropsWithRemovePost = {...requiredProps, actions, enableEmojiPicker: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...requiredPropsWithRemovePost}/>);
        (wrapper.instance() as PostInfo).removePost();
        expect(wrapper).toMatchSnapshot();
        expect(removePost).toHaveBeenCalledTimes(1);
        expect(removePost).toBeCalledWith(post);
    });

    test('should match snapshot, hover', () => {
        const props = {...requiredProps, hover: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, showTimeWithoutHover', () => {
        const props = {...requiredProps, showTimeWithoutHover: true};

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(<PostInfo {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should pass props correctly to PostFlagIcon', () => {
        const props = {
            ...requiredProps,
            isFlagged: true,
        };

        const wrapper: ShallowWrapper<any, any, PostInfo> = shallow(
            <PostInfo {...props}/>,
        );

        const flagIcon = wrapper.find(PostFlagIcon);
        expect(flagIcon).toHaveLength(1);
        expect(flagIcon.prop('postId')).toEqual(props.post.id);
        expect(flagIcon.prop('isFlagged')).toEqual(props.isFlagged);
    });
});
