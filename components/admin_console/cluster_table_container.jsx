// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {getClusterStatus} from 'actions/admin_actions.jsx';
import LoadingScreen from '../loading_screen.jsx';

import ClusterTable from './cluster_table.jsx';

export default class ClusterTableContainer extends React.Component {
    constructor(props) {
        super(props);

        this.load = this.load.bind(this);
        this.reload = this.reload.bind(this);

        this.interval = null;

        this.state = {
            clusterInfos: null,
        };
    }

    load() {
        getClusterStatus(
            (data) => {
                this.setState({
                    clusterInfos: data,
                });
            },
            null
        );
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.load();

        // reload the cluster status every 15 seconds
        this.interval = setInterval(this.load, 15000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    reload(e) {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            clusterInfos: null,
        });

        this.load();
    }

    render() {
        if (this.state.clusterInfos == null) {
            return (<LoadingScreen/>);
        }

        return (
            <ClusterTable
                clusterInfos={this.state.clusterInfos}
                reload={this.reload}
            />
        );
    }
}
