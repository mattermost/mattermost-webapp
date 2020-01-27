// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DataGridHeader from './data_grid_header';
import DataGridRow from './data_grid_row';

import './data_grid.scss';

export type Column = {
    name: string,
    field: string,
    sortable?: boolean,
}

type Props = {
    rows: any[],
    rowComponent?: React.ComponentClass,
    columns: Column[],
};

class DataGrid extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }

    renderRows() {
        const RowComponent = this.props.rowComponent || DataGridRow;
        return this.props.rows.map((row, index) => {
            return (
                <RowComponent
                    key={row.id}
                    index={index}
                    row={row}
                    columns={this.props.columns}
                />
            );
        });
    }

    renderHeader() {
        return (
            <DataGridHeader
                columns={this.props.columns}
            />
        );
    }

    public render() {
        return (
            <div className='DataGrid'>
                {this.renderHeader()}
                {this.renderRows()}
            </div>
        );
    }
}

export default DataGrid;
