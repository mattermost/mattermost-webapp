// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamIcon from './team_icon';

describe('components/widgets/team-icon', () => {
    test('basic icon', () => {
        const wrapper = shallow(
            <TeamIcon name='test'/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('image icon', () => {
        const wrapper = shallow(
            <TeamIcon
                url='http://example.com/image.png'
                name='test'
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('small icon', () => {
        const wrapper = shallow(
            <TeamIcon
                name='test'
                size='sm'
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('icon with hover', () => {
        const wrapper = shallow(
            <TeamIcon
                name='test'
                withHover={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
