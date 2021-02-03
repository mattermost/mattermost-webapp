// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import DataTableHeader from './data_table_header';
import DataTableRow from './data_table_row';

import 'components/next_steps_view/next_steps_view.scss';

import './data_table.scss';
import { render } from 'enzyme';

export type Column = {
    name: string | JSX.Element;
    field: string;
    customClass?: string;
}

export type Row = {
    cells: {
        [key: string]: JSX.Element | string;
    };
    onClick?: () => void;
}

type Props = {
    rows: Row[];
    columns: Column[];
    placeholderEmpty?: JSX.Element;
    loadingIndicator?: JSX.Element;
    page: number;
    startCount: number;
    endCount: number;
    total?: number;
    loading: boolean;

    nextPage: () => void;
    previousPage: () => void;
};

const DataTable: React.FC<Props> = (props) => {

    const nextPage = () => {
        if (!props.loading) {
            props.nextPage();
        }
    }

    const previousPage = () => {
        if (!props.loading) {
            props.previousPage();
        }
    }

    const renderRows = (): JSX.Element | null => {
        const {rows} = props;
        let rowsToRender: JSX.Element | JSX.Element[] | null = null;

        if (props.loading) {
            if (props.loadingIndicator) {
                rowsToRender = (
                    <div className='Table__loading'>
                        {props.loadingIndicator}
                    </div>
                );
            } else {
                rowsToRender = (
                    <div className='Table__loading'>
                        <LoadingSpinner/>
                        <FormattedMessage
                            id='admin.data_grid.loading'
                            defaultMessage='Loading'
                        />
                    </div>
                );
            }
        } else if (rows.length === 0) {
            const placeholder = props.placeholderEmpty || (
                <FormattedMessage
                    id='admin.data_grid.empty'
                    defaultMessage='No items found'
                />
            );
            rowsToRender = (
                <div className='Table__empty'>
                    {placeholder}
                </div>
            );
        } else {
            rowsToRender = rows.map((row: Row, i: number) => {
                return (
                    <DataTableRow
                        row={row}
                        columns={props.columns}
                        key={i}
                    />
                )
            })
        }

        return (
            <>
                {rowsToRender}
            </>
        );
    }


    const renderFooter = (): JSX.Element | null => {
        const {startCount, endCount, total} = props;
        let footer: JSX.Element | null = null;
        if (total) {
            const firstPage = startCount <= 1;
            const lastPage = endCount >= total;

            let prevPageFn: () => void = previousPage;
            if (firstPage) {
                prevPageFn = () => {};
            }

            let nextPageFn: () => void = nextPage;
            if (lastPage) {
                nextPageFn = () => {};
            }

            footer = (
                <div className='Table__paging'>
                    <FormattedMarkdownMessage
                        id='admin.billing.history.pageInfo'
                        defaultMessage='{startRecord} - {endRecord} of {totalRecords}'
                        values={{
                            startRecord: startCount,
                            endRecord: endCount,
                            totalRecords: total,
                        }}
                    />
                    <button
                        onClick={prevPageFn}
                        disabled={firstPage}
                    >
                        <i className='icon icon-chevron-left'/>
                    </button>
                    <button
                        onClick={nextPageFn}
                        disabled={lastPage}
                    >
                        <i className='icon icon-chevron-right'/>
                    </button>
                </div>
            );
        }

        return footer;
    }
    
    return (
        <>
            <table className='Table__table'>
                <DataTableHeader
                    columns={props.columns}
                />
                {renderRows()}
            </table>
            {renderFooter()}
        </>
    );
};

export default DataTable;
