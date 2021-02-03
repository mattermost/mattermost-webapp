// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Row, Column} from './data_table';

import './data_table.scss';

type Props = {
    columns: Column[];
    row: Row;
}

const DataTableRow: React.FC<Props> = (props: Props) => {
    const renderCell = (row: Row, column: Column) => {
        return (
            <td
                className={column.customClass}
                key={column.field}
            >
                {row.cells[column.field]}
            </td>
        );
    };

    return (
        <tr
            className='Table__table-row'
            onClick={props.row.onClick}
        >
            {props.columns.map((col) => renderCell(props.row, col))}
        </tr>
    );
};

export default DataTableRow;
