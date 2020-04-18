// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {Post, PostType} from 'mattermost-redux/src/types/posts';

import RhsCard from './rhs_card';

describe('components/rhs_card/RhsCard', () => {
    const post = {
        id: '123',
        message: 'test',
        type: 'system_displayname_change' as PostType,
        create_at: 1542994995740,
        props: {},
    };

    const pluginPostCardTypes = {
        id: 'id',
        pluginId: 'pluginId',
        type: 'type',
    };

    const currentChannel = {
        id: '111',
        name: 'town-square',
        display_name: 'Town Square',
    };

    it('should match when no post is selected', () => {
        const wrapper = shallow(
            <RhsCard
                selected={undefined}
                channel={currentChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when no plugin defining card types', () => {
        const wrapper = shallow(
            <RhsCard
                selected={post as Post}
                channel={currentChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when plugin defining card types don\'t match with the post type', () => {
        const wrapper = shallow(
            <RhsCard
                selected={post as Post}
                pluginPostCardTypes={{notMatchingType: {...pluginPostCardTypes, component: () => <i/>}}}
                channel={currentChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when plugin defining card types match with the post type', () => {
        const wrapper = shallow(
            <RhsCard
                selected={post as Post}
                pluginPostCardTypes={{test: {...pluginPostCardTypes, component: () => <i/>}}}
                channel={currentChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
