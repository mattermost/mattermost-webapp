// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import classNames from 'classnames';

import './data_grid.scss';

import {Column} from './data_grid';

export type Props = {
    columns: Column[];
    customHeaderClass?: string;
}

class DataGridHeader extends React.Component<Props> {
    renderHeaderElement(col: Column) {
        const style: CSSProperties = {};
        if (col.width) {
            style.flexGrow = col.width;
        }

        return (
            <div
                key={col.field}
                className='DataGrid_cell'
                style={style}
            >
                {col.name}
            </div>
        );
    }

    render() {
        return (
            <div className={classNames('DataGrid_header', this.props.customHeaderClass)}>
                {this.props.columns.map((col) => this.renderHeaderElement(col))}
            </div>
        );
    }
}

export default DataGridHeader;
