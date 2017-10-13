// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {browserHistory} from 'react-router/es6';
import {FormattedMessage} from 'react-intl';

import LoadingScreen from 'components/loading_screen.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import AbstractOAuthApp from '../abstract_oauth_app.jsx';

const HEADER = {id: 'integrations.edit', defaultMessage: 'Edit'};
const FOOTER = {id: 'update_incoming_webhook.update', defaultMessage: 'Update'};

export default class EditOAuthApp extends React.PureComponent {
    static propTypes = {
        /**
        * The current team
        */
        team: PropTypes.object.isRequired,

        /**
        * Set if the current user is a system admin
        */
        isSystemAdmin: PropTypes.bool,

        /**
        * The id of the OAuthApp to edit
        */
        oauthAppId: PropTypes.string.isRequired,

        /**
        * The OAuthApp data
        */
        oauthApp: PropTypes.object,

        /**
        * The request state for editOAuthApp action. Contains status and error
        */
        editOAuthAppRequest: PropTypes.object.isRequired,

        actions: PropTypes.shape({
            /**
            * The function to call to get OAuthApp
            */
            getOAuthApp: PropTypes.func.isRequired,

            /**
            * The function to call to edit OAuthApp
            */
            editOAuthApp: PropTypes.func.isRequired
        }).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            showConfirmModal: false,
            serverError: ''
        };
    }

    componentDidMount() {
        if (window.mm_config.EnableOAuthServiceProvider === 'true') {
            this.props.actions.getOAuthApp(this.props.oauthAppId);
        }
    }

    editOAuthApp = async app => {
        this.newApp = app;

        if (this.props.oauthApp.id) {
            app.id = this.props.oauthApp.id;
        }

        if (this.props.oauthApp.token) {
            app.token = this.props.oauthApp.token;
        }

        const callbackUrlsSame =
            this.props.oauthApp.callback_urls.length === app.callback_urls.length &&
            this.props.oauthApp.callback_urls.every((v, i) => v === app.callback_urls[i]);

        if (callbackUrlsSame === false) {
            this.handleConfirmModal();
        } else {
            await this.submitOAuthApp();
        }
    };

    handleConfirmModal = () => {
        this.setState({showConfirmModal: true});
    };

    confirmModalDismissed = () => {
        this.setState({showConfirmModal: false});
    };

    submitOAuthApp = async () => {
        this.setState({serverError: ''});

        const data = await this.props.actions.editOAuthApp(this.newApp);

        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/oauth2-apps`);
            return;
        }

        this.setState({showConfirmModal: false});

        if (this.props.editOAuthAppRequest.error) {
            this.setState({serverError: this.props.editOAuthAppRequest.error.message});
        }
    };

    renderExtra = () => {
        const confirmButton = <FormattedMessage id="update_command.update" defaultMessage="Update" />;

        const confirmTitle = (
            <FormattedMessage id="update_oauth_app.confirm" defaultMessage="Edit OAuth 2.0 application" />
        );

        const confirmMessage = (
            <FormattedMessage
                id="update_oauth_app.question"
                defaultMessage="Your changes may break the existing OAuth 2.0 application. Are you sure you would like to update it?"
            />
        );

        return (
            <ConfirmModal
                title={confirmTitle}
                message={confirmMessage}
                confirmButtonText={confirmButton}
                show={this.state.showConfirmModal}
                onConfirm={this.submitOAuthApp}
                onCancel={this.confirmModalDismissed}
            />
        );
    };

    render() {
        if (!this.props.oauthApp) {
            return <LoadingScreen />;
        }

        return (
            <AbstractOAuthApp
                team={this.props.team}
                isSystemAdmin={this.props.isSystemAdmin}
                header={HEADER}
                footer={FOOTER}
                renderExtra={this.renderExtra()}
                action={this.editOAuthApp}
                serverError={this.state.serverError}
                initialApp={this.props.oauthApp}
            />
        );
    }
}
