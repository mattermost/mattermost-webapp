// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import RhsCard from './rhs_card.jsx';

describe('comoponents/rhs_card/RhsCard', () => {
    const post = {
        id: '123',
        message: 'test',
        type: 'test',
        create_at: 1542994995740,
        props: {},
    };

    const currentChannel = {
        id: '111',
        name: 'town-square',
        display_name: 'Town Square',
    };

    const baseProps = {
        channel: currentChannel,
        isMobileView: false,
        selected: null,
    };

    it('should match when no post is selected', () => {
        const wrapper = shallow(
            <RhsCard
                {...baseProps}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when no plugin defining card types', () => {
        const wrapper = shallow(
            <RhsCard
                {...baseProps}
                selected={post}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when plugin defining card types don\'t match with the post type', () => {
        const wrapper = shallow(
            <RhsCard
                {...baseProps}
                selected={post}
                pluginPostCardTypes={{notMatchingType: {component: () => <i/>}}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match on post when plugin defining card types match with the post type', () => {
        const wrapper = shallow(
            <RhsCard
                {...baseProps}
                selected={post}
                pluginPostCardTypes={{test: {component: () => <i/>}}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
