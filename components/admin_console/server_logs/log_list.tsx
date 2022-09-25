// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionFunc} from 'mattermost-redux/types/actions';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import {FilterOptions} from 'components/admin_console/filter/filter';

import {LogFilter, LogObject} from '@mattermost/types/admin';
import {ChannelSearchOpts} from '@mattermost/types/channels';

type Props = {
    logs: LogObject[];
    getLogs: (logFilter: LogFilter) => ActionFunc;
};

type State = {
    loading: boolean;
    term: string;
    filters: FilterOptions;
    page: number;
};

export default class LogList extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            term: '',
            filters: {},
            page: 1,
        };
    }

    isSearching = (term: string, filters: ChannelSearchOpts) => {
        return term.length > 0 || Object.keys(filters).length > 0;
    }

    onSearch = async () => {}

    getColumns = (): Column[] => {
        const caller: JSX.Element = (
            <FormattedMessage
                id='admin.logs.caller'
                defaultMessage='Caller'
            />
        );
        const jobId: JSX.Element = (
            <FormattedMessage
                id='admin.logs.id'
                defaultMessage='Job ID'
            />
        );
        const level: JSX.Element = (
            <FormattedMessage
                id='admin.log.logLevel'
                defaultMessage='Log Level'
            />
        );
        const msg: JSX.Element = (
            <FormattedMessage
                id='user.settings.notifications.autoResponderPlaceholder'
                defaultMessage='Message'
            />
        );
        const timestamp: JSX.Element = (
            <FormattedMessage
                id='admin.compliance_table.timestamp'
                defaultMessage='Timestamp'
            />
        );
        const worker: JSX.Element = (
            <FormattedMessage
                id='admin.logs.worker'
                defaultMessage='Worker'
            />
        );

        return [
            {
                field: 'caller',
                fixed: true,
                name: caller,
                textAlign: 'left',
                width: 2,
            },
            {
                field: 'job_id',
                fixed: true,
                name: jobId,
                textAlign: 'left',
                width: 1.5,
            },
            {
                field: 'level',
                fixed: true,
                name: level,
                textAlign: 'left',
                width: 1.5,
            },
            {
                field: 'msg',
                fixed: true,
                name: msg,
                textAlign: 'left',
                width: 1.5,
            },
            {
                field: 'timestamp',
                fixed: true,
                name: timestamp,
                textAlign: 'left',
                width: 1.5,
            },
            {
                field: 'worker',
                fixed: true,
                name: worker,
                textAlign: 'left',
            },
        ];
    }

    getRows = (): Row[] => {
        return this.props.logs.map((log: LogObject) => {
            return {
                cells: {
                    caller: (
                        <span
                            className='group-name overflow--ellipsis row-content'
                            data-testid='caller'
                        >
                            <span className='group-description row-content'>
                                {log.caller}
                            </span>
                        </span>
                    ),
                    job_id: (
                        <span className='group-description row-content'>
                            {log.job_id}
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
                    timestamp: (
                        <span
                            className='group-description row-content'
                        >
                            {log.timestamp}
                        </span>
                    ),
                    worker: (
                        <span
                            className='group-description row-content'
                        >
                            {log.worker}
                        </span>
                    ),
                },
                onClick: () => {/* browserHistory.push(`/admin_console/user_management/channels/${channel.id}`) */},
            };
        });
    }

    onFilter = () => {}

    render = (): JSX.Element => {
        const {term} = this.state;
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();

        const placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.no_channels_found'
                defaultMessage='No channels found'
            />
        );

        const rowsContainerStyles = {
            minHeight: `${rows.length * 40}px`,
        };

        const logsCount = this.props.logs?.length ?? 0;

        return (
            <div className='LogTable'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.state.loading}
                    startCount={1}
                    endCount={logsCount}
                    total={logsCount}
                    onSearch={this.onSearch}
                    term={term}
                    placeholderEmpty={placeholderEmpty}
                    rowsContainerStyles={rowsContainerStyles}
                    page={1}
                    nextPage={() => {}}
                    previousPage={() => {}}
                />
            </div>
        );
    }
}
