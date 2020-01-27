// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './data_grid.scss';

import {Column} from './data_grid';

export type Props = {
    columns: Column[],
}

class DataGridHeader extends React.Component<Props> {
    renderHeaderElement(col: Column) {
        return (
            <div
                className="dg-cell"
                key={col.name}
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
