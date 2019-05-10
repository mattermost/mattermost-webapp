// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ReactionList from './reaction_list.jsx';

describe('components/ReactionList', () => {
    const reaction = {
        user_id: '1rj9fokoeffrigu7sk5uc8aiih',
        post_id: 'xbqfo5qb4bb4ffmj9hqfji6fiw',
        emoji_name: 'expressionless',
        create_at: 1542994995740,
    };

    const reactions = {[reaction.user_id + '-' + reaction.emoji_name]: reaction};

    const post = {
        id: 'post_id',
        has_reactions: true,
    };

    const teamId = 'teamId';

    const actions = {
        getReactionsForPost: jest.fn(),
        addReaction: jest.fn(),
    };

    const baseProps = {
        post,
        teamId,
        reactions,
        enableEmojiPicker: true,
        actions,
    };

    test('Should match snapshot for reactions and should call getReactionsForPost as there is no metadata', () => {
        const wrapper = shallow(
            <ReactionList {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(actions.getReactionsForPost).toHaveBeenCalledTimes(1);
    });

    test('should not call getReactionsForPost as there is is metadata', () => {
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                metadata: {},
            },
        };

        shallow(
            <ReactionList {...props}/>
        );

        expect(actions.getReactionsForPost).not.toHaveBeenCalled();
    });
});
