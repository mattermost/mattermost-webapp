// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Reaction from 'components/post_view/reaction/reaction.jsx';
import {getSortedUsers} from 'utils/utils';

describe('components/post_view/Reaction', () => {
    const post = {id: 'post_id_1'};
    const profiles = [{id: 'user_id_2', username: 'username_2'}];
    const reactions = [{user_id: 'user_id_2'}, {user_id: 'user_id_3'}];
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
        const wrapper = shallow(<Reaction {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when a current user reacted to a post', () => {
        const newReactions = [{user_id: 'user_id_1'}, {user_id: 'user_id_2'}];
        const newProfiles = [{id: 'user_id_1', username: 'username_1'}];
        const props = {
            ...baseProps,
            reactions: newReactions,
            profiles: newProfiles,
            otherUsersCount: 1,
            sortedUsers: getSortedUsers(
                newReactions,
                currentUserId,
                newProfiles,
                'username',
            ),
        };
        const wrapper = shallow(<Reaction {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should return null/empty if no emojiImageUrl', () => {
        const props = {...baseProps, emojiImageUrl: ''};
        const wrapper = shallow(<Reaction {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should apply read-only class if user does not have permission to add reaction', () => {
        const props = {...baseProps, canAddReaction: false};
        const wrapper = shallow(<Reaction {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should apply read-only class if user does not have permission to remove reaction', () => {
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
        const wrapper = shallow(<Reaction {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called actions.getMissingProfilesByIds when loadMissingProfiles is called', () => {
        const newActions = {...actions, getMissingProfilesByIds: jest.fn()};
        const props = {...baseProps, actions: newActions};

        const wrapper = shallow(<Reaction {...props}/>);
        wrapper.instance().loadMissingProfiles();

        expect(newActions.getMissingProfilesByIds).toHaveBeenCalledTimes(1);
        expect(newActions.getMissingProfilesByIds).toHaveBeenCalledWith([reactions[0].user_id, reactions[1].user_id]);
    });
});
