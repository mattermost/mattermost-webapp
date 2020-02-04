// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { CSSProperties } from 'react';

import {Column} from './data_grid';

import './data_grid.scss';

type Props = {
    columns: Column[],
    row: any,
    index: number,
}

class DataGridRow extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    shouldComponentUpdate(nextProps: Props) {
        return this.props.columns.length !== nextProps.columns.length;
    }

    renderCell(row: any, column: Column) {
        if (column.field in row) {
            row = row[column.field];
        }

        let style: CSSProperties = {};
        if (column.width) {
            style['flexGrow'] = column.width;
        }

        return (
            <div
                key={column.field}
                className="dg-cell"
                style={style}
            >
                {row}
            </div>
        );
    }

    render() {
        return (
            <div className="dg-row">
                {this.props.columns.map((col) => this.renderCell(this.props.row, col))}
            </div>
        );
    }
}

export default DataGridRow;
