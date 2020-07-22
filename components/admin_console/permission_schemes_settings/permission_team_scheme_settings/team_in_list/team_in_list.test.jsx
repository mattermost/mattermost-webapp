// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamInList from 'components/admin_console/permission_schemes_settings/permission_team_scheme_settings/team_in_list/team_in_list.jsx';

describe('components/admin_console/permission_schemes_settings/permission_team_scheme_settings/team_in_list/team_in_list', () => {
    test('should match snapshot with team', () => {
        const props = {
            team: {
                id: 12345,
                display_name: 'testTeam',
            },
        };

        const wrapper = shallow(
            <TeamInList {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
