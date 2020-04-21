// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {Post} from 'mattermost-redux/types/posts';

import RhsCard from './rhs_card';

describe('components/rhs_card/RhsCard', () => {
    const post: Post = {
        id: '123',
        create_at: 1542994995740,
        update_at: 1543081395740,
        edit_at: 1543167795740,
        delete_at: 1543254195740,
        is_pinned: false,
        user_id: 'userID',
        channel_id: 'channelID',
        root_id: 'rootID',
        parent_id: 'parentID',
        original_id: 'originalID',
        message: 'test',
        type: 'system_join_channel',
        props: {},
        hashtags: '#abc',
        pending_post_id: 'pendingPostID',
        reply_count: 0,
        metadata: {
            embeds: [],
            emojis: [],
            files: [],
            images: {},
            reactions: []
        }
    };

    it('should match when no post is selected', () => {
        const wrapper = shallow(
            <RhsCard
                enablePostUsernameOverride={true}
                teamUrl={'team/url'}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when no plugin defining card types', () => {
        const wrapper = shallow(
            <RhsCard
                selected={post}
                teamUrl={'team/url'}
                enablePostUsernameOverride={false}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when plugin defining card types don\'t match with the post type', () => {
        const wrapper = shallow(
            <RhsCard
                selected={post}
                pluginPostCardTypes={
                    {
                        notMatchingType: {
                            component: (() => <i/>),
                            pluginId: 'pluginID',
                            id: 'ID',
                            type: 'type'
                        }
                    }
                }
                teamUrl={'team/url'}
                enablePostUsernameOverride={false}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when plugin defining card types match with the post type', () => {
        const wrapper = shallow(
            <RhsCard
                selected={post}
                pluginPostCardTypes={
                    {
                        system_join_channel: {
                            component: (() => <i/>),
                            id: 'ID',
                            pluginId: 'pluginID',
                            type: 'type'
                        },
                    }
                }
                enablePostUsernameOverride={false}
                teamUrl={'team/url'}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
