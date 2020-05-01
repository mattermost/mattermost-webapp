// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

import {Column} from './data_grid';

import './data_grid.scss';

type Props = {
    columns: Column[];
    row: any;
    index: number;
}

class DataGridRow extends React.Component<Props> {
    shouldComponentUpdate(nextProps: Props) {
        return this.props.columns.length !== nextProps.columns.length;
    }

    renderCell(row: any, column: Column) {
        let cell = row;
        if (column.field in row) {
            cell = row[column.field];
        }

        const style: CSSProperties = {};
        if (column.width) {
            style.flexGrow = column.width;
        }

        if (column.textAlign) {
            style.textAlign = column.textAlign;
        }

        return (
            <div
                key={column.field}
                className='dg-cell'
                style={style}
            >
                {cell}
            </div>
        );
    }

    render() {
        return (
            <div className='dg-row'>
                {this.props.columns.map((col) => this.renderCell(this.props.row, col))}
            </div>
        );
    }
}

export default DataGridRow;
