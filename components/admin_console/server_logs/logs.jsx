// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import LoadingScreen from 'components/loading_screen.jsx';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header.jsx';

import LogList from './log_list.jsx';

export default class Logs extends React.Component {
    static propTypes = {

        /*
         * Array of logs to render
         */
        logs: PropTypes.arrayOf(PropTypes.string).isRequired,
        nextPage: PropTypes.func,

        actions: PropTypes.shape({

            /*
             * Function to fetch logs
             */
            getLogs: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            loadingLogs: true,
            page: 0,
            perPage: 1000,
        };
    }

    componentDidMount() {
        this.props.actions.getLogs(this.state.page, this.state.perPage).then(
            () => this.setState({loadingLogs: false})
        );
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) { // eslint-disable-line camelcase
        if (this.state.page !== nextState.page) {
            this.props.actions.getLogs(nextState.page, nextState.perPage).then(
                () => this.setState({loadingLogs: false})
            );
        }
    }

    nextPage = () => {
        this.setState({page: this.state.page + 1});
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    reload = () => {
        this.setState({loadingLogs: true});
        this.props.actions.getLogs(this.state.page, this.state.perPage).then(
            () => this.setState({loadingLogs: false})
        );
    }

    render() {
        let content = null;

        if (this.state.loadingLogs) {
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
                    <div className='admin-console__content'>
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
