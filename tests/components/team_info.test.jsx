// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamInfo from 'components/team_info.jsx';

jest.mock('utils/utils.jsx');

describe('components/TeamInfo', () => {
    const defaultProps = {
        team: {
            id: 'xxxx',
            name: 'test-team',
            display_name: 'Test team',
        },
    };

    test('should match snapshot, without icon', () => {
        const utilsMock = require.requireMock('utils/utils.jsx');
        utilsMock.imageURLForTeam.mockImplementation(() => null);
        const wrapper = shallow(<TeamInfo {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with icon', () => {
        const utilsMock = require.requireMock('utils/utils.jsx');
        utilsMock.imageURLForTeam.mockImplementation(() => 'test');

        const wrapper = shallow(<TeamInfo {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
