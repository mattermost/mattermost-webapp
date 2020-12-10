// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Reaction from 'components/post_view/reaction/reaction.jsx';
import {getSortedUsers} from 'utils/utils';
import ReactionComponent from 'components/post_view/reaction/reaction.jsx';
import {Post, PostType, PostMetadata} from 'mattermost-redux/types/posts';
import {PostTypes} from 'mattermost-redux/constants/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import {TestHelper} from 'utils/test_helper';
function createUser(id: string, username: string, bot: boolean): UserProfile {
    return TestHelper.getUserMock({
        id,
        username,
        is_bot: bot,
    });
}
describe('components/post_view/Reaction', () => {
    const post: Post = {
        id: 'post_id',
        channel_id: 'channel_id',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        is_pinned: false,
        message: 'post message',
        original_id: '',
        parent_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: PostTypes.ADD_REMOVE as PostType,
        update_at: 1502715372443,
        user_id: 'user_id',
        hashtags: '', 
        reply_count: 0, 
        metadata: {} as PostMetadata,
    };

    const user2 = createUser('user_id_2', 'username_2', false);
    const profiles = [user2];
    const reactions = [{user_id: 'user_id_2', post_id: 'post_id_2', emoji_name: '', create_at: 0}, {user_id: 'user_id_3', post_id: 'post_id_3', emoji_name: '', create_at: 0}];
    const emojiName = 'smile';
    const actions = {
        addReaction: () => {}, //eslint-disable-line no-empty-function
        getMissingProfilesByIds: () => {}, //eslint-disable-line no-empty-function
        removeReaction: () => {}, //eslint-disable-line no-empty-function
    };
    const currentUserId = 'user_id_1';

    const baseProps = {
        canAddReaction: true,
        canRemoveReaction: true,
        currentUserId,
        post,
        emojiName,
        reactionCount: 2,
        profiles,
        otherUsersCount: 2,
        reactions,
        emojiImageUrl: 'emoji_image_url',
        actions,
        sortedUsers: getSortedUsers(
            reactions,
            currentUserId,
            profiles,
            'username',
        ),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ReactionComponent {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when a current user reacted to a post', () => {
        const user1 = createUser('user_id_1', 'username_1', false);
        
    
        
        const newProfiles = [user1];
        const props = {
            ...baseProps,
            profiles: newProfiles,
            otherUsersCount: 1,
            sortedUsers: getSortedUsers(
                currentUserId,
                newProfiles,
                'username',
            ),
        };
        const wrapper = shallow(<ReactionComponent {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should return null/empty if no emojiImageUrl', () => {
        const props = {...baseProps, emojiImageUrl: ''};
        const wrapper = shallow(<ReactionComponent {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should disable add reaction when you do not have permissions', () => {
        const props = {...baseProps, canAddReaction: false};
        const wrapper = shallow(<ReactionComponent {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should disable remove reaction when you do not have permissions', () => {
        const newCurrentUserId = 'user_id_2';
        const props = {
            ...baseProps,
            canRemoveReaction: false,
            currentUserId: newCurrentUserId,
            sortedUsers: getSortedUsers(
                reactions,
                newCurrentUserId,
                profiles,
                'username',
            ),
        };
        const wrapper = shallow(<ReactionComponent {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called actions.addReaction when handleAddReaction is called', () => {
        const newActions = {...actions, addReaction: jest.fn()};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(<ReactionComponent {...props}/>);
        const instance = wrapper.instance() as ReactionComponent;
        //@ts-ignore
        instance.handleAddReaction({preventDefault: jest.fn()});
        expect(newActions.addReaction).toHaveBeenCalledTimes(1);
        expect(newActions.addReaction).toHaveBeenCalledWith(post.id, emojiName);
    });

    test('should have called actions.removeReaction when handleRemoveReaction is called', () => {
        const newActions = {...actions, removeReaction: jest.fn()};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(<ReactionComponent {...props}/>);
        const instance = wrapper.instance() as ReactionComponent;
        //@ts-ignore
        instance.handleRemoveReaction({preventDefault: jest.fn()});

        expect(newActions.removeReaction).toHaveBeenCalledTimes(1);
        expect(newActions.removeReaction).toHaveBeenCalledWith(post.id, emojiName);
    });

    test('should have called actions.getMissingProfilesByIds when loadMissingProfiles is called', () => {
        const newActions = {...actions, getMissingProfilesByIds: jest.fn()};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(<ReactionComponent {...props}/>);
        const instance = wrapper.instance() as ReactionComponent;
        instance.loadMissingProfiles();

        expect(newActions.getMissingProfilesByIds).toHaveBeenCalledTimes(1);
        expect(newActions.getMissingProfilesByIds).toHaveBeenCalledWith([reactions[0].user_id, reactions[1].user_id]);
    });
});
