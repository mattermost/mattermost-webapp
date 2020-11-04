// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ReactionList from './reaction_list.jsx';
import {EmojiIndicesByAlias} from 'utils/emoji';
import Constants from 'utils/constants';

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

    test('should not render add reaction button when existing reactions exceeded limit', async () => {
        const mappedReactions = {...reactions};
        for (const [emoji, index] of [...EmojiIndicesByAlias]) {
            if (+Constants.EMOJI_REACTIONS_LIMIT === +index) {break;}
            mappedReactions[`${reaction.user_id}-${emoji}`] = await {...reaction, emoji_name: emoji}
        }

        const props = {
            ...baseProps,
            reactions: mappedReactions,
        };

        const wrapper = shallow(
            <ReactionList {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.post-reaction-list').text()).toBe("")
    });

    test('should render add reaction button when existing reactions within limit', async () => {
        const wrapper = shallow(
            <ReactionList {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.post-reaction-list').text()).toBe("<EmojiPickerOverlay /><AddReactionIcon />")
    });
});
