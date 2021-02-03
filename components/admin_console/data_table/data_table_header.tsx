// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

import {Column} from './data_table';

import './data_table.scss';

type Props = {
    columns: Column[];
}

const DataTableHeader: React.FC<Props> = (props) => {

    const renderHeaderElement = (column: Column) => {
        return (
            <th
                key={column.field}
            >
                {column.name}
            </th>
        );
    }

    return (
        <tr className='Table__table-header'>
            {props.columns.map((col) => renderHeaderElement(col))}
        </tr>
    );
};

export default DataTableHeader;
