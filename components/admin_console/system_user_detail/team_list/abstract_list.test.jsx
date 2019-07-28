// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';

import AbstractList from './abstract_list.jsx';
import TeamRow from './team_row.jsx';

describe('admin_console/system_user_detail/team_list/AbstractList', () => {
    const renderRow = jest.fn((item) => {
        return (
            <TeamRow
                key={item.id}
                team={item}
                onRowClick={jest.fn()}
            />
        );
    });

    const teamsWithMemberships = [
        {
            id: 'id1',
            display_name: 'Team 1',
            description: 'Team 1 description',
        },
        {
            id: 'id2',
            display_name: 'Team 2',
            description: 'The 2 description',
        },
    ];

    const Header = shallow(
        <div
            className='groups-list--header'
            key={0}
        >
            <div className='group-name'>
                <FormattedMessage
                    id='admin.team_settings.team_list.nameHeader'
                    defaultMessage='Name'
                />
            </div>
            <div className='group-description'>
                <FormattedMessage
                    id='admin.systemUserDetail.teamList.header.type'
                    defaultMessage='Type'
                />
            </div>
            <div className='group-description'>
                <FormattedMessage
                    id='admin.systemUserDetail.teamList.header.role'
                    defaultMessage='Role'
                />
            </div>
        </div>
    );

    const getTeamsData = jest.fn(() => {
        return Promise.resolve(teamsWithMemberships);
    });

    const defaultProps = {
        userId: '1234',
        data: [],
        onPageChangedCallback: jest.fn(),
        total: 0,
        header: Header,
        renderRow,
        emptyListTextId: 'admin.team_settings.team_list.no_teams_found',
        emptyListTextDefaultMessage: 'No teams found',
        actions: {
            getTeamsData,
            removeGroup: jest.fn(),
        },
    };

    test('should match snapshot if loading', () => {
        const props = defaultProps;
        const wrapper = shallow(<AbstractList {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot no data', () => {
        const props = defaultProps;
        const wrapper = shallow(<AbstractList {...props}/>);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with teams data populated', () => {
        const props = defaultProps;
        const wrapper = shallow(
            <AbstractList
                {...props}
                data={teamsWithMemberships}
                total={2}
            />
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with enough teams data to require paging', () => {
        const props = defaultProps;
        const moreTeams = teamsWithMemberships;
        for (let i = 3; i <= 30; i++) {
            moreTeams.push({
                id: 'id' + i,
                display_name: 'Team ' + i,
                description: 'Team ' + i + ' description',
            });
        }
        const wrapper = shallow(
            <AbstractList
                {...props}
                data={moreTeams}
                total={30}
            />
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when on second page of pagination', () => {
        const props = defaultProps;
        const moreTeams = teamsWithMemberships;
        for (let i = 3; i <= 30; i++) {
            moreTeams.push({
                id: 'id' + i,
                display_name: 'Team ' + i,
                description: 'Team ' + i + ' description',
            });
        }
        const wrapper = shallow(
            <AbstractList
                {...props}
                data={moreTeams}
                total={30}
            />
        );
        wrapper.setState({
            loading: false,
            page: 1,
        });
        expect(wrapper).toMatchSnapshot();
    });
});