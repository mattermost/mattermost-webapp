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
    };

    const teamId = 'teamId';

    const actions = {
        addReaction: jest.fn(),
    };

    const baseProps = {
        post,
        teamId,
        reactions,
        enableEmojiPicker: true,
        actions,
    };

    test('should render nothing when no reactions', () => {
        const props = {
            ...baseProps,
            reactions: {},
        };

        const wrapper = shallow(
            <ReactionList {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render when there are reactions', () => {
        const wrapper = shallow(
            <ReactionList {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
