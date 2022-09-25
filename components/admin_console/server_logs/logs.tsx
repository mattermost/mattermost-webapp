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
    loadingLogs: boolean;
    serverNames: LogServerNames;
    logLevels: LogLevels;
    dateFrom: string;
    dateTo: string;
};

export default class Logs extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loadingLogs: true,
            serverNames: [],
            logLevels: [],
            dateFrom: '',
            dateTo: '',
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

    render() {
        let content = null;

        if (this.state.loadingLogs || !this.props.logs) {
            content = <LoadingScreen/>;
        } else {
            content = (
                <LogList
                    {...this.props}
                />
            );
        }

        return (
            <div className='wrapper--admin'>
                <FormattedAdminHeader
                    id='admin.logs.title'
                    defaultMessage='Server Logs'
                />

                <div className='admin-console__wrapper'>
                    <div className='admin-logs-content admin-console__content'>
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
                                id='admin.logs.reload'
                                defaultMessage='Reload'
                            />
                        </button>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}
