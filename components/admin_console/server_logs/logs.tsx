// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionFunc} from 'mattermost-redux/types/actions';

import LoadingScreen from 'components/loading_screen';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {LogFilter, LogLevels, LogObject, LogServerNames} from '@mattermost/types/admin';

import LogList from './log_list';

type Props = {
    logs: LogObject[];
    actions: {
        getLogs: (logFilter: LogFilter) => ActionFunc;
    };
};

type State = {
    dateFrom: string;
    dateTo: string;
    loadingLogs: boolean;
    logLevels: LogLevels;
    search: string;
    serverNames: LogServerNames;
};

export default class Logs extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            dateFrom: '',
            dateTo: '',
            loadingLogs: true,
            logLevels: [],
            search: '',
            serverNames: [],
        };
    }

    componentDidMount() {
        this.reload();
    }

    reload = async () => {
        this.setState({loadingLogs: true});
        await this.props.actions.getLogs({
            serverNames: this.state.serverNames,
            logLevels: this.state.logLevels,
            dateFrom: this.state.dateFrom,
            dateTo: this.state.dateTo,
        });
        this.setState({loadingLogs: false});
    }

    onSearchChange = (search: string) => {
        this.setState({search});
    }

    render() {
        return (
            <div className='wrapper--admin'>
                <FormattedAdminHeader
                    id='admin.logs.title'
                    defaultMessage='Server Logs'
                />

                <div className='admin-console__wrapper'>
                    <div className='admin-logs-content admin-console__content'>
                        <div className='banner_wrapper'>
                            <div className='banner'>
                                <div className='banner__content'>
                                    <FormattedMessage
                                        id='admin.logs.bannerDesc'
                                        defaultMessage='To look up users by User ID or Token ID, go to User Management > Users and paste the ID into the search filter.'
                                    />
                                </div>
                            </div>
                            <button
                                type='submit'
                                className='btn btn-primary'
                                onClick={this.reload}
                            >
                                <FormattedMessage
                                    id='admin.logs.ReloadLogs'
                                    defaultMessage='ReloadLogs'
                                />
                            </button>
                        </div>
                        {this.state.loadingLogs ?
                            <LoadingScreen/> :
                            <LogList
                                logs={this.props.logs}
                                onSearchChange={this.onSearchChange}
                                search={this.state.search}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}
