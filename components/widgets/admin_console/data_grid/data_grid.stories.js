// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';

import DataGrid from './data_grid';

const baseProps = {
    page: 1,
    startCount: 1,
    endCount: 3,
    total: 3,
    loading: false,

    nextPage: null,
    previousPage: null,
};

const twoColumnGrid = {
    rows: [
        {name: 'Joe Schmoe', team: 'Admin Team'},
        {name: 'Foo Bar', team: 'Admin Team'},
        {name: 'Some Guy', team: 'Admin Team'},
    ],

    columns: [
        {name: 'Name', field: 'name', width: 3},
        {name: 'Team', field: 'team'},
    ],
};

const fourColumnGrid = {
    rows: [
        {name: 'Joe Schmoe', team: 'Admin Team', role: 'Member', group: 'Developers'},
        {name: 'Foo Bar', team: 'Admin Team', role: 'Member', group: 'Developers'},
        {name: 'Some Guy', team: 'Admin Team', role: 'Member', group: 'Developers'},
    ],

    columns: [
        {name: 'Name', field: 'name', width: 2, fixed: true},
        {name: 'Team', field: 'team'},
        {name: 'Role', field: 'role'},
        {name: 'Group', field: 'group', fixed: true},
    ],
};

storiesOf('Data Grid', module).
    add(
        '2 column grid',
        () => {
            return (
                <DataGrid
                    {...baseProps}
                    {...twoColumnGrid}
                />
            );
        }
    ).add(
        '4 column grid',
        () => {
            return (
                <DataGrid
                    {...baseProps}
                    {...fourColumnGrid}
                />
            );
        }
    ).add(
        'Loading grid',
        () => {
            return (
                <DataGrid
                    {...baseProps}
                    {...fourColumnGrid}
                    loading={true}
                />
            );
        }
    ).add(
        'Empty grid',
        () => {
            return (
                <DataGrid
                    {...baseProps}
                    {...fourColumnGrid}
                    rows={[]}
                />
            );
        }
    );