// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { CSSProperties } from 'react';

import './data_grid.scss';

import {Column} from './data_grid';

export type Props = {
    columns: Column[],
}

class DataGridHeader extends React.Component<Props> {
    renderHeaderElement(col: Column) {
        let style: CSSProperties = {};
        if (col.width) {
            style['flexGrow'] = col.width;
        }


        return (
            <div
                key={col.name}
                className="dg-cell"
                style={style}
            >
                {col.name}
            </div>
        )
    }

    public render() {
        return (
            <div className="dg-header">
                {this.props.columns.map(col => this.renderHeaderElement(col))}
            </div>
        );
    }
}

export default DataGridHeader;
