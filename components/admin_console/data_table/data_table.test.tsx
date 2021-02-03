// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DataTable from './data_table';

describe('components/admin_console/data_table/DataTable', () => {

    const RECORDS_PER_PAGE = 5;

    const baseProps = {
        page: 1,
        startCount: 0,
        endCount: 0,
        total: 0,
        loading: false,

        nextPage: jest.fn(),
        previousPage: jest.fn(),

        rows: [],
        columns: [],
    };

    test('should match snapshot with no items found', () => {
        const wrapper = shallow(
            <DataTable
                {...baseProps}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot while loading', () => {
        const wrapper = shallow(
            <DataTable
                {...baseProps}
                loading={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with only one page of results', () => {
        const wrapper = shallow(
            <DataTable
                {...baseProps}
                rows={[
                    {cells: {name: 'Joe Schmoe', team: 'Admin Team'}},
                    {cells: {name: 'Foo Bar', team: 'Admin Team'}},
                    {cells: {name: 'Some Guy', team: 'Admin Team'}},
                ]}
                columns={[
                    {name: 'Name', field: 'name'},
                    {name: 'Team', field: 'team'},
                ]}
                page={0}
                startCount={1}
                endCount={3}
                total={3}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});

