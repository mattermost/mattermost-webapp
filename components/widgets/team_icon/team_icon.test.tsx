// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamIcon from './team_icon';

describe('components/widgets/team-icon', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <TeamIcon name='test'/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
