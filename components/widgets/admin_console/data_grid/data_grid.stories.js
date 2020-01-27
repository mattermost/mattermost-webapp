// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';

import DataGrid from './data_grid';

const baseGridProps = {
    rows: [
        {name: 'Joe Schmoe', team: 'Admin Team'},
        {name: 'Foo Bar', team: 'Admin Team'},
        {name: 'Some Guy', team: 'Admin Team'},
    ],

    columns: [
        {name: 'Name', field: 'name'},
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
        {name: 'Name', field: 'name'},
        {name: 'Team', field: 'team'},
        {name: 'Role', field: 'role'},
        {name: 'Group', field: 'group'},
    ],
};


storiesOf('Data Grid', module).
    add(
        '2 column grid',
        () => {
            return (<DataGrid {...baseGridProps}></DataGrid>);
        }
    ).add(
        '4 column grid',
        () => {
            return (<DataGrid {...fourColumnGrid}></DataGrid>);
        }
    );