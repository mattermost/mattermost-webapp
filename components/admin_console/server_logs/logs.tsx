// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionFunc} from 'mattermost-redux/types/actions';

import LoadingScreen from 'components/loading_screen';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import LogList from './log_list';

type Props = {
    logs: string[];
    actions: {
        getLogs: (page?: number | undefined, perPage?: number | undefined) => ActionFunc;
    };
};

type State = {
    loadingLogs: boolean;
    page: number;
    perPage: number;
};

export default class Logs extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loadingLogs: true,
            page: 0,
            perPage: 1000,
        };
    }

    componentDidMount() {
        this.reload();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.page !== prevState.page) {
            this.reload();
        }
    }

    nextPage = () => {
        this.setState({page: this.state.page + 1});
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    reload = async () => {
        this.setState({loadingLogs: true});
        await this.props.actions.getLogs(this.state.page, this.state.perPage);
        this.setState({loadingLogs: false});
    }

    render() {
        let content = null;

        if (this.state.loadingLogs || !this.props.logs || this.props.logs.length === 0) {
            content = <LoadingScreen/>;
        } else {
            content = (
                <LogList
                    {...this.props}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    page={this.state.page}
                    perPage={this.state.perPage}
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
                                    defaultMessage='To look up users by User ID or Token ID, go to Reporting > Users and paste the ID into the search filter.'
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
