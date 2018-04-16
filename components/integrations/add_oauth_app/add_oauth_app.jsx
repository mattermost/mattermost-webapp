// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import AbstractOAuthApp from '../abstract_oauth_app.jsx';

const HEADER = {id: 'add_oauth_app.header', defaultMessage: 'Add'};
const FOOTER = {id: 'installed_oauth_apps.save', defaultMessage: 'Save'};

export default class AddOAuthApp extends React.PureComponent {
    static propTypes = {

        /**
        * The team data
        */
        team: PropTypes.object,

        /**
        * The request state for addOAuthApp action. Contains status and error
        */
        addOAuthAppRequest: PropTypes.object.isRequired,

        actions: PropTypes.shape({

            /**
            * The function to call to add new OAuthApp
            */
            addOAuthApp: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: '',
        };
    }

    addOAuthApp = async (app) => {
        this.setState({serverError: ''});

        const {data} = await this.props.actions.addOAuthApp(app);
        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/confirm?type=oauth2-apps&id=${data.id}`);
            return;
        }

        if (this.props.addOAuthAppRequest.error) {
            this.setState({serverError: this.props.addOAuthAppRequest.error.message});
        }
    }

    render() {
        return (
            <AbstractOAuthApp
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                renderExtra={''}
                action={this.addOAuthApp}
                serverError={this.state.serverError}
            />
        );
    }
}
