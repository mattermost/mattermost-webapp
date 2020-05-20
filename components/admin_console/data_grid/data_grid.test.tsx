// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DataGrid from './data_grid';

describe('components/admin_console/data_grid/DataGrid', () => {
    const baseProps = {
        page: 1,
        startCount: 0,
        endCount: 0,
        total: 0,
        loading: false,

        nextPage: jest.fn(),
        previousPage: jest.fn(),
        search: jest.fn(),

        rows: [],
        columns: [],
        term: '',
    };

    test('should match snapshot with no items found', () => {
        const wrapper = shallow(
            <DataGrid
                {...baseProps}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot while loading', () => {
        const wrapper = shallow(
            <DataGrid
                {...baseProps}
                loading={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with content and custom styling on rows', () => {
        const wrapper = shallow(
            <DataGrid
                {...baseProps}
                rows={[
                    {name: 'Joe Schmoe', team: 'Admin Team'},
                    {name: 'Foo Bar', team: 'Admin Team'},
                    {name: 'Some Guy', team: 'Admin Team'},
                ]}
                columns={[
                    {name: 'Name', field: 'name', width: 3, overflow: 'hidden'},
                    {name: 'Team', field: 'team', textAlign: 'center'},
                ]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
