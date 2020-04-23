// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DataGridHeader from './data_grid_header';
import DataGridRow from './data_grid_row';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

import {FormattedMessage} from 'react-intl';

import './data_grid.scss';

export type Column = {
    name: string,
    field: string,
    width?: number,
    fixed?: boolean,

    textAlign?: '-moz-initial' | 'inherit' | 'initial' | 'revert' | 'unset' | 'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start' | undefined,
}

type Props = {
    rows: any[],
    rowComponent?: React.ComponentClass,
    columns: Column[],

    page: number,
    startCount: number,
    endCount: number,
    total?: number,
    loading: boolean,

    nextPage: () => void;
    previousPage: () => void;
};

type State = {
    visibleColumns: Column[],
    fixedColumns: Column[],
    hiddenColumns: Column[],
};

class DataGrid extends React.PureComponent<Props, State> {
    private ref: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            visibleColumns: this.props.columns,
            hiddenColumns: [],
            fixedColumns: this.props.columns.filter((col) => col.fixed),
        };

        this.ref = React.createRef();
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    private handleResize = () => {
        if (!this.ref || !this.ref.current) {
            return;
        }

        let visibleColumns: Column[] = this.props.columns;
        const numVisibleColumns = (this.ref.current.clientWidth - 50) / 125 - this.state.fixedColumns.length;
        let columnCount = 0;

        visibleColumns = visibleColumns.filter((column) => {
            if (column.fixed) {
                return true;
            } else if (numVisibleColumns > columnCount) {
                columnCount += column.width || 1;
                return true
            }

            return false;
        });

        this.setState({visibleColumns});
    }

    renderRows() {
        const RowComponent = this.props.rowComponent || DataGridRow;
        const {rows} = this.props;
        const {visibleColumns} = this.state;

        return rows.map((row, index) => {
            return (
                <RowComponent
                    key={row.id}
                    index={index}
                    row={row}
                    columns={visibleColumns}
                />
            );
        });
    }

    renderHeader() {
        return (
            <DataGridHeader
                columns={this.state.visibleColumns}
            />
        );
    }

    private nextPage = () => {
        if (!this.props.loading) {
            this.props.nextPage();
        }
    }

    private previousPage = () => {
        if (!this.props.loading) {
            this.props.previousPage();
        }
    }

    renderFooter() {
        const { startCount, endCount, total } = this.props;

        if (!total) {
            return;
        }

        const firstPage = startCount <= 1;
        const lastPage = endCount >= total;

        return (
            <div className="dg-row">
                <div className="dg-cell dg-footer">
                    <FormattedMessage
                        id='admin.data_grid.paginatorCount'
                        defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                        values={{
                            startCount,
                            endCount,
                            total,
                        }}
                    />

                    <button
                        className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                        onClick={firstPage ? undefined : this.previousPage}
                        disabled={firstPage}
                    >
                        <PreviousIcon/>
                    </button>
                    <button
                        className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                        onClick={lastPage ? undefined : this.nextPage}
                        disabled={lastPage}
                    >
                        <NextIcon/>
                    </button>
                </div>
            </div>
        );
    }


    public render() {
        const styleOverrides = {
            // TODO: Add generated styles here based on props
        };

        return (
            <div
                className='DataGrid'
                style={styleOverrides}
                ref={this.ref}
            >
                {this.renderHeader()}
                {this.renderRows()}
                {this.renderFooter()}
            </div>
        );
    }
}

export default DataGrid;
