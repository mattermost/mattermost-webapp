// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Column} from './data_grid';

import './data_grid.scss';

type Props = Column;

class DataGridColumn extends React.Component<Props> {
    renderCell(row: any, column: Column) {
        if (column.field in row) {
            row = row[column.field];
        }

        return (
            <div className="cell">
                {row}
            </div>
        );
    }

    public render() {
        return (
            <div className="row">
                {this.props.columns.map(col => this.renderCell(this.props.row, col))}
            </div>
        );
    }
}

export default DataGridRow;
