// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamRow from './team_row.jsx';

describe('admin_console/team_channel_settings/team/TeamRow', () => {
    const testTeam = {
        id: '123',
        display_name: 'team',
        type: 'O',
        group_constrained: false,
        name: 'DN',
    };
    test('should match snapshot', () => {
        const wrapper = shallow(
            <TeamRow

                onRowClick={jest.fn()}
                team={testTeam}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
