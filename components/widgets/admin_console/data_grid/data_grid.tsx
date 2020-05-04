// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

import DataGridHeader from './data_grid_header';
import DataGridRow from './data_grid_row';

import './data_grid.scss';

export type Column = {
    name: string;
    field: string;
    fixed?: boolean;

    // Optional styling overrides
    width?: number;
    textAlign?: '-moz-initial' | 'inherit' | 'initial' | 'revert' | 'unset' | 'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start' | undefined;
    overflow?: string;
}

export type Row = {
    [key: string]: JSX.Element | string;
}

type Props = {
    rows: Row[];
    columns: Column[];

    minimumColumnWidth?: number;

    page: number;
    startCount: number;
    endCount: number;
    total?: number;
    loading: boolean;

    nextPage: () => void;
    previousPage: () => void;
};

type State = {
    visibleColumns: Column[];
    fixedColumns: Column[];
    hiddenColumns: Column[];
    minimumColumnWidth: number;
};

const MINIMUM_COLUMN_WIDTH = 150;

class DataGrid extends React.PureComponent<Props, State> {
    private ref: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        let minimumColumnWidth = MINIMUM_COLUMN_WIDTH;
        if (props.minimumColumnWidth) {
            minimumColumnWidth = props.minimumColumnWidth;
        }

        this.state = {
            visibleColumns: this.props.columns,
            hiddenColumns: [],
            fixedColumns: this.props.columns.filter((col) => col.fixed),
            minimumColumnWidth,
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

        const {minimumColumnWidth, fixedColumns} = this.state;
        const fixedColumnWidth = (fixedColumns.length * minimumColumnWidth);

        let visibleColumns: Column[] = this.props.columns;
        let availableWidth = this.ref.current.clientWidth - fixedColumnWidth - 50;

        visibleColumns = visibleColumns.filter((column) => {
            if (availableWidth > minimumColumnWidth) {
                availableWidth -= minimumColumnWidth;
                return true;
            }

            return Boolean(column.fixed);
        });

        this.setState({visibleColumns});
    }

    renderRows() {
        const {rows} = this.props;
        const {visibleColumns} = this.state;

        return rows.map((row, index) => {
            return (
                <DataGridRow
                    key={index}
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
        const {startCount, endCount, total} = this.props;
        let footer;

        if (total) {
            const firstPage = startCount <= 1;
            const lastPage = endCount >= total;

            let prevPageFn: () => void;
            if (!firstPage) {
                prevPageFn = this.previousPage;
            }

            let nextPageFn: () => void;
            if (!lastPage) {
                nextPageFn = this.nextPage;
            }

            footer = (
                <div className='dg-row'>
                    <div className='dg-cell dg-footer'>
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
                            onClick={() => prevPageFn()}
                            disabled={firstPage}
                        >
                            <PreviousIcon/>
                        </button>
                        <button
                            className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                            onClick={() => nextPageFn()}
                            disabled={lastPage}
                        >
                            <NextIcon/>
                        </button>
                    </div>
                </div>
            );
        }

        return footer;
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
