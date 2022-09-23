// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionFunc} from 'mattermost-redux/types/actions';

import LoadingScreen from 'components/loading_screen';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {LogObject, LogsSortByEnum, LogsSortOrderEnum} from '@mattermost/types/admin';

// import LogList from './log_list';

type GetLogsPayload = {
    search: string;
    sortBy: LogsSortByEnum;
    sortOrder: LogsSortOrderEnum;
}

type Props = {
    logs: any[string];
};

type State = {
    loadingLogs: boolean;
    search: string;
    sortBy: LogsSortByEnum;
    sortOrder: LogsSortOrderEnum;
};

export default class Logs extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loadingLogs: true,
            search: '',
            sortBy: LogsSortByEnum.TIMESTAMP,
            sortOrder: LogsSortOrderEnum.DESC,
        };
    }
    console.log(props);
    componentDidMount() {
        this.reload();
    }

    reload = async () => {
        this.setState({loadingLogs: true});
        await this.props.actions.getLogs({search: this.state.search, sortBy: this.state.sortBy, sortOrder: this.state.sortOrder});
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
