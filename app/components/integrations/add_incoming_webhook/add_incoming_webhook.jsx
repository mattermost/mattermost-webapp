// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import {t} from 'utils/i18n';
import AbstractIncomingWebhook from 'components/integrations/abstract_incoming_webhook.jsx';

const HEADER = {id: t('integrations.add'), defaultMessage: 'Add'};
const FOOTER = {id: t('add_incoming_webhook.save'), defaultMessage: 'Save'};
const LOADING = {id: t('add_incoming_webhook.saving'), defaultMessage: 'Saving...'};

export default class AddIncomingWebhook extends React.PureComponent {
    static propTypes = {

        /**
        * The current team
        */
        team: PropTypes.object.isRequired,

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
            createIncomingHook: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: '',
        };
    }

    addIncomingHook = async (hook) => {
        this.setState({serverError: ''});

        const {data, error} = await this.props.actions.createIncomingHook(hook);
        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/confirm?type=incoming_webhooks&id=${data.id}`);
            return;
        }

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    render() {
        return (
            <AbstractIncomingWebhook
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                loading={LOADING}
                enablePostUsernameOverride={this.props.enablePostUsernameOverride}
                enablePostIconOverride={this.props.enablePostIconOverride}
                action={this.addIncomingHook}
                serverError={this.state.serverError}
            />
        );
    }
}
