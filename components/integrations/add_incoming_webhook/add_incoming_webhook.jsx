// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import AbstractIncomingWebhook from 'components/integrations/abstract_incoming_webhook.jsx';

const HEADER = {id: 'integrations.add', defaultMessage: 'Add'};
const FOOTER = {id: 'add_incoming_webhook.save', defaultMessage: 'Save'};

export default class AddIncomingWebhook extends React.PureComponent {
    static propTypes = {

        /**
        * The current team
        */
        team: PropTypes.object.isRequired,

        /**
        * The request state for createIncomingHook action. Contains status and error
        */
        createIncomingHookRequest: PropTypes.object.isRequired,

        /**
        * Whether to allow configuration of the default post username.
        */
        enablePostUsernameOverride: PropTypes.bool.isRequired,

        /**
        * Whether to allow configuration of the default post icon.
        */
        enablePostIconOverride: PropTypes.bool.isRequired,

        actions: PropTypes.shape({

            /**
            * The function to call to add a new incoming webhook
            */
            createIncomingHook: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: ''
        };
    }

    addIncomingHook = async (hook) => {
        this.setState({serverError: ''});

        const {data} = await this.props.actions.createIncomingHook(hook);
        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/confirm?type=incoming_webhooks&id=${data.id}`);
            return;
        }

        if (this.props.createIncomingHookRequest.error) {
            this.setState({serverError: this.props.createIncomingHookRequest.error.message});
        }
    }

    render() {
        return (
            <AbstractIncomingWebhook
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                enablePostUsernameOverride={this.props.enablePostUsernameOverride}
                enablePostIconOverride={this.props.enablePostIconOverride}
                action={this.addIncomingHook}
                serverError={this.state.serverError}
            />
        );
    }
}
