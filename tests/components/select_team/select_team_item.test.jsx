// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SelectTeamItem from 'components/select_team/components/select_team_item.jsx';

describe('components/select_team/components/SelectTeamItem', () => {
    const baseProps = {
        team: {display_name: 'team_display_name', description: 'team description'},
        onTeamClick: jest.fn(),
        loading: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<SelectTeamItem {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on loading', () => {
        const props = {...baseProps, loading: true};
        const wrapper = shallow(<SelectTeamItem {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call props.onTeamClick on handleTeamClick', () => {
        const wrapper = shallow(<SelectTeamItem {...baseProps}/>);
        wrapper.instance().handleTeamClick({preventDefault: jest.fn()});
        expect(baseProps.onTeamClick).toHaveBeenCalledTimes(1);
        expect(baseProps.onTeamClick).toHaveBeenCalledWith(baseProps.team);
    });
});
