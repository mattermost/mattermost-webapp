// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import {t} from 'utils/i18n';
import AbstractOutgoingWebhook from 'components/integrations/abstract_outgoing_webhook.jsx';

const HEADER = {id: t('integrations.add'), defaultMessage: 'Add'};
const FOOTER = {id: t('add_outgoing_webhook.save'), defaultMessage: 'Save'};
const LOADING = {id: t('add_outgoing_webhook.saving'), defaultMessage: 'Saving...'};

export default class AddOutgoingWebhook extends React.PureComponent {
    static propTypes = {

        /**
         * The current team
         */
        team: PropTypes.object.isRequired,

        actions: PropTypes.shape({

            /**
             * The function to call to add a new outgoing webhook
             */
            createOutgoingHook: PropTypes.func.isRequired,
        }).isRequired,

        /**
         * Whether to allow configuration of the default post username.
         */
        enablePostUsernameOverride: PropTypes.bool.isRequired,

        /**
         * Whether to allow configuration of the default post icon.
         */
        enablePostIconOverride: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: '',
        };
    }

    addOutgoingHook = async (hook) => {
        this.setState({serverError: ''});

        const {data, error} = await this.props.actions.createOutgoingHook(hook);
        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/confirm?type=outgoing_webhooks&id=${data.id}`);
            return;
        }

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    render() {
        return (
            <AbstractOutgoingWebhook
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                loading={LOADING}
                renderExtra={''}
                action={this.addOutgoingHook}
                serverError={this.state.serverError}
                enablePostUsernameOverride={this.props.enablePostUsernameOverride}
                enablePostIconOverride={this.props.enablePostIconOverride}
            />
        );
    }
}
