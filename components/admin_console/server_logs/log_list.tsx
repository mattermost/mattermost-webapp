// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {LogObject} from '@mattermost/types/admin';

import {ChannelWithTeamData, ChannelSearchOpts} from '@mattermost/types/channels';
import {debounce} from 'mattermost-redux/actions/helpers';

import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import {Constants} from 'utils/constants';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import {FilterOptions} from 'components/admin_console/filter/filter';
import TeamFilterDropdown from 'components/admin_console/filter/team_filter_dropdown';

type Props = {
    logs: LogObject[];
};

type State = {
    loading: boolean;
    term: string[],
    filters: FilterOptions;
};

export default class LogList extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            term: [],
            filters: {}
        };
    }

    componentDidMount() {
        this.loadPage();
    }

    isSearching = (term: string, filters: ChannelSearchOpts) => {
        // return term.length > 0 || Object.keys(filters).length > 0;
    }

    loadPage = async (page = 0, term = '', filters = {}) => {
        this.setState({loading: true, term, filters});

        // await this.props.actions.getData(page, PAGE_SIZE, '', false, true);
        // this.setState({page, loading: false});
    }


    onSearch = async (term = '') => {
        // this.loadPage(0, term, this.state.filters);
    }

    getColumns = (): Column[] => {
        const caller: JSX.Element = (
            <FormattedMessage
                id='admin.logs.caller'
                defaultMessage='Caller'
            />
        );
        const job_id: JSX.Element = (
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
                name: caller,
                field: 'caller',
                width: 2,
                fixed: true,
            },
            {
                name: job_id,
                field: 'job_id',
                width: 1.5,
                fixed: true,
            },
            {
                name: level,
                field: 'level',
                width: 1.5,
                fixed: true,
            },
            {
                name: msg,
                field: 'message',
                textAlign: 'right',
                width: 1.5,
                fixed: true,
            },
            {
                name: timestamp,
                field: 'timestamp',
                textAlign: 'right',
                width: 1.5,
                fixed: true,
            },
            {
                name: worker,
                field: 'worker',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    getRows = (): Row[] => {
        const {channels, term, filters} = this.state;

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
                onClick: () => browserHistory.push(`/admin_console/user_management/channels/${channel.id}`),
            };
        });
    }

    onFilter = () => {}

    render = (): JSX.Element => {
        const {term} = this.state;
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();

        let placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.no_channels_found'
                defaultMessage='No channels found'
            />
        );

        const rowsContainerStyles = {
            minHeight: `${rows.length * 40}px`,
        };

        const filterOptions = {};
        const filterProps = {};

        return (
            <div className='LogTable'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.state.loading}
                    // startCount={startCount}
                    // endCount={endCount}
                    // total={total}
                    onSearch={this.onSearch}
                    // term={term}
                    // placeholderEmpty={placeholderEmpty}
                    rowsContainerStyles={rowsContainerStyles}
                    // filterProps={filterProps}
                />
            </div>
        );
    }
}
