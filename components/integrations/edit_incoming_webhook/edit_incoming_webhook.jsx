// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import {t} from 'utils/i18n';
import AbstractIncomingWebhook from 'components/integrations/abstract_incoming_webhook.jsx';
import LoadingScreen from 'components/loading_screen';

const HEADER = {id: t('integrations.edit'), defaultMessage: 'Edit'};
const FOOTER = {id: t('update_incoming_webhook.update'), defaultMessage: 'Update'};
const LOADING = {id: t('update_incoming_webhook.updating'), defaultMessage: 'Updating...'};

export default class EditIncomingWebhook extends React.PureComponent {
    static propTypes = {

        /**
        * The current team
        */
        team: PropTypes.object.isRequired,

        /**
        * The incoming webhook to edit
        */
        hook: PropTypes.object,

        /**
        * The id of the incoming webhook to edit
        */
        hookId: PropTypes.string.isRequired,

        /**
        * Whether or not incoming webhooks are enabled.
        */
        enableIncomingWebhooks: PropTypes.bool.isRequired,

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
            * The function to call to update an incoming webhook
            */
            updateIncomingHook: PropTypes.func.isRequired,

            /**
            * The function to call to get an incoming webhook
            */
            getIncomingHook: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            showConfirmModal: false,
            serverError: '',
        };
    }

    componentDidMount() {
        if (this.props.enableIncomingWebhooks) {
            this.props.actions.getIncomingHook(this.props.hookId);
        }
    }

    editIncomingHook = async (hook) => {
        this.newHook = hook;

        if (this.props.hook.id) {
            hook.id = this.props.hook.id;
        }

        if (this.props.hook.token) {
            hook.token = this.props.hook.token;
        }

        await this.submitHook();
    }

    submitHook = async () => {
        this.setState({serverError: ''});

        const {data, error} = await this.props.actions.updateIncomingHook(this.newHook);

        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/incoming_webhooks`);
            return;
        }

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    render() {
        if (!this.props.hook) {
            return <LoadingScreen/>;
        }

        return (
            <AbstractIncomingWebhook
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                loading={LOADING}
                enablePostUsernameOverride={this.props.enablePostUsernameOverride}
                enablePostIconOverride={this.props.enablePostIconOverride}
                action={this.editIncomingHook}
                serverError={this.state.serverError}
                initialHook={this.props.hook}
            />
        );
    }
}
