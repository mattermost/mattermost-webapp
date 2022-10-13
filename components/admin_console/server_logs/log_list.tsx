// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import DropdownInput from 'components/dropdown_input';
import {FilterOptions} from 'components/admin_console/filter/filter';

import {LogFilter, LogLevelEnum, LogObject} from '@mattermost/types/admin';
import {ChannelSearchOpts} from '@mattermost/types/channels';
import './log_list.scss';

type Props = {
    loading: boolean;
    logs: LogObject[];
    onFiltersChange: (filters: LogFilter) => void;
    onSearchChange: (term: string) => void;
    search: string;
    filters: LogFilter;
};

export default class LogList extends React.PureComponent<Props> {
    isSearching = (term: string, filters: ChannelSearchOpts) => {
        return term.length > 0 || Object.keys(filters).length > 0;
    }

    onSearch = (term: string) => {
        this.props.onSearchChange(term);
    }

    getColumns = (): Column[] => {
        const timestamp: JSX.Element = (
            <FormattedMessage
                id='admin.compliance_table.timestamp'
                defaultMessage='Timestamp'
            />
        );
        const level: JSX.Element = (
            <FormattedMessage
                id='admin.log.logLevel'
                defaultMessage='Level'
            />
        );
        const msg: JSX.Element = (
            <FormattedMessage
                id='user.settings.notifications.autoResponderPlaceholder'
                defaultMessage='Message'
            />
        );
        const worker: JSX.Element = (
            <FormattedMessage
                id='admin.logs.worker'
                defaultMessage='Worker'
            />
        );
        const caller: JSX.Element = (
            <FormattedMessage
                id='admin.logs.caller'
                defaultMessage='Caller'
            />
        );
        const options: JSX.Element = (
            <FormattedMessage
                id='admin.logs.options'
                defaultMessage='Options'
            />
        );

        return [
            {
                field: 'timestamp',
                fixed: true,
                name: timestamp,
                textAlign: 'left',
                width: 2,
            },
            {
                field: 'level',
                fixed: true,
                name: level,
                textAlign: 'left',
                width: 1,
            },
            {
                field: 'msg',
                fixed: true,
                name: msg,
                textAlign: 'left',
                width: 2,
            },
            {
                field: 'worker',
                fixed: true,
                name: worker,
                textAlign: 'left',
            },
            {
                field: 'caller',
                fixed: true,
                name: caller,
                textAlign: 'left',
                width: 1.5,
            },
            {
                field: 'options',
                fixed: true,
                name: options,
                textAlign: 'left',
                width: 1,
            },
        ];
    }

    getRows = (): Row[] => {
        return this.props.logs.map((log: LogObject) => {
            return {
                cells: {
                    timestamp: (
                        <span
                            className='group-name overflow--ellipsis row-content'
                            data-testid='timestamp'
                        >
                            <span className='group-description row-content'>
                                {log.timestamp}
                            </span>
                        </span>
                    ),
                    level: (
                        <span className='group-description adjusted row-content'>
                            {log.level}
                        </span>
                    ),
                    msg: (
                        <span
                            className='group-description row-content'
                            title={log.msg}
                        >
                            {log.msg}
                        </span>
                    ),
                    caller: (
                        <span
                            className='group-description row-content'
                        >
                            {log.caller}
                        </span>
                    ),
                    worker: (
                        <span
                            className='group-description row-content'
                        >
                            {log.worker}
                        </span>
                    ),
                    options: (
                        <button
                            type='submit'
                            className='btn btn-inverted'
                        >
                            <FormattedMessage
                                id='admin.logs.fullEvent'
                                defaultMessage='Full Log event'
                            />
                        </button>
                    ),
                },
                onClick: () => {/* browserHistory.push(`/admin_console/user_management/channels/${channel.id}`) */},
            };
        });
    }

    onFilter = (filterOptions: FilterOptions) => {
        const filters = {} as unknown as LogFilter;
        const levelValues = filterOptions.levels.values;
        if (levelValues.all.value) {
            filters.logLevels = [];
        } else {
            filters.logLevels = Object.keys(levelValues).reduce<LogFilter['logLevels']>((acc, key) => {
                if (levelValues[key].value) {
                    acc.push(key as LogLevelEnum);
                }
                return acc;
            }, []);
        }
        this.props.onFiltersChange(filters);
    }

    render = (): JSX.Element => {
        const {search} = this.props;
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();
        const logsCount = this.props.logs?.length ?? 0;

        const placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.no_channels_found'
                defaultMessage='No channels found'
            />
        );

        const rowsContainerStyles = {
            minHeight: `${rows.length * 40}px`,
        };

        const errorsButton: JSX.Element = (
            <button
                type='submit'
                className='btn btn-dangerous'
            >
                <FormattedMessage
                    id='admin.logs.showErrors'
                    defaultMessage='Show last {n} errors'
                />
            </button>
        );

        const filterOptions: FilterOptions = {
            nodes: {
                name: 'Node',
                values: {
                    node1: {
                        name: (
                            <FormattedMessage
                                id='admin.logs.node1'
                                defaultMessage='Node 1'
                            />
                        ),
                        value: 'node_1',
                    },
                },
                keys: ['node1'],
                type: DropdownInput,
            },
            levels: {
                name: 'Levels',
                values: {
                    all: {
                        name: (
                            <FormattedMessage
                                id='admin.logs.Alllevels'
                                defaultMessage='All levels'
                            />
                        ),
                        value: true,
                    },
                    error: {
                        name: (
                            <FormattedMessage
                                id='admin.logs.Error'
                                defaultMessage='Error'
                            />
                        ),
                        value: false,
                    },
                    warn: {
                        name: (
                            <FormattedMessage
                                id='admin.logs.Warn'
                                defaultMessage='Warn'
                            />
                        ),
                        value: false,
                    },
                    info: {
                        name: (
                            <FormattedMessage
                                id='admin.logs.Info'
                                defaultMessage='Info'
                            />
                        ),
                        value: false,
                    },
                    debug: {
                        name: (
                            <FormattedMessage
                                id='admin.logs.Debug'
                                defaultMessage='Debug'
                            />
                        ),
                        value: false,
                    },
                },
                keys: ['all', 'error', 'info', 'debug'],
            },
        };

        const filterProps = {
            options: filterOptions,
            keys: ['nodes', 'levels'],
            onFilter: this.onFilter,
        };

        return (
            <div className='LogTable'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.props.loading}
                    startCount={1}
                    endCount={logsCount}
                    total={logsCount}
                    onSearch={this.onSearch}
                    term={search}
                    placeholderEmpty={placeholderEmpty}
                    rowsContainerStyles={rowsContainerStyles}
                    page={1}
                    nextPage={() => {}}
                    previousPage={() => {}}
                    filterProps={filterProps}
                    extraComponent={errorsButton}
                />
            </div>
        );
    }
}
