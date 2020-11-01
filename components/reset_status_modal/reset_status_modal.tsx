// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Preferences} from 'mattermost-redux/constants';

import ConfirmModal from 'components/confirm_modal';
import {toTitleCase} from 'utils/utils.jsx';
import {UserStatuses} from 'utils/constants';
import {t} from 'utils/i18n';

export default class ResetStatusModal extends React.PureComponent {
    static propTypes = {

        /*
         * The user's preference for whether their status is automatically reset
         */
        autoResetPref: PropTypes.string,

        /*
         * Props value is used to update currentUserStatus
         */
        currentUserStatus: PropTypes.string,

        /*
         * Props value is used to reset status from status_dropdown
         */
        newStatus: PropTypes.string,

        /**
         * Function called when modal is dismissed
         */
        onHide: PropTypes.func,
        actions: PropTypes.shape({

            /*
             * Function to get and then reset the user's status if needed
             */
            autoResetStatus: PropTypes.func.isRequired,

            /*
             * Function to set the status for a user
             */
            setStatus: PropTypes.func.isRequired,

            /*
             * Function to save user preferences
             */
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            currentUserStatus: {},
            newStatus: props.newStatus || 'online',
        };
    }

    componentDidMount() {
        this.props.actions.autoResetStatus().then(
            (status) => {
                const statusIsManual = status.manual;
                const autoResetPrefNotSet = this.props.autoResetPref === '';

                this.setState({
                    currentUserStatus: status, // Set in state until status refactor where we store 'manual' field in redux
                    show: Boolean(status.status === UserStatuses.OUT_OF_OFFICE || (statusIsManual && autoResetPrefNotSet)),
                });
            },
        );
    }

    hideModal = () => {
        this.setState({show: false});
    };

    onConfirm = (checked) => {
        this.hideModal();

        const newStatus = {...this.state.currentUserStatus};
        newStatus.status = this.state.newStatus;
        this.props.actions.setStatus(newStatus);

        if (checked) {
            const pref = {category: Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, user_id: newStatus.user_id, name: newStatus.user_id, value: 'true'};
            this.props.actions.savePreferences(pref.user_id, [pref]);
        }
    };

    onCancel = (checked) => {
        this.hideModal();

        if (checked) {
            const status = {...this.state.currentUserStatus};
            const pref = {category: Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, user_id: status.user_id, name: status.user_id, value: 'false'};
            this.props.actions.savePreferences(pref.user_id, [pref]);
        }
    };

    renderModalMessage = () => {
        if (this.props.currentUserStatus === UserStatuses.OUT_OF_OFFICE) {
            return (
                <FormattedMessage
                    id={`modal.manual_status.auto_responder.message_${this.state.newStatus}`}
                    defaultMessage='Would you like to switch your status to "{status}" and disable Automatic Replies?'
                    values={{
                        status: toTitleCase(this.state.newStatus),
                    }}
                />
            );
        }

        return (
            <FormattedMessage
                id={`modal.manual_status.message_${this.state.newStatus}`}
                defaultMessage='Would you like to switch your status to "{status}"?'
                values={{
                    status: toTitleCase(this.state.newStatus),
                }}
            />
        );
    };

    render() {
        const userStatus = this.state.currentUserStatus.status || '';
        const userStatusId = 'modal.manual_status.title_' + userStatus;
        const manualStatusTitle = (
            <FormattedMessage
                id={userStatusId}
                defaultMessage='Your Status is Set to "{status}"'
                values={{
                    status: toTitleCase(userStatus),
                }}
            />
        );

        const manualStatusMessage = this.renderModalMessage();

        const manualStatusButton = (
            <FormattedMessage
                id={`modal.manual_status.button_${this.state.newStatus}`}
                defaultMessage='Yes, set my status to "{status}"'
                values={{
                    status: toTitleCase(this.state.newStatus),
                }}
            />
        );
        const manualStatusId = 'modal.manual_status.cancel_' + userStatus;
        const manualStatusCancel = (
            <FormattedMessage
                id={manualStatusId}
                defaultMessage='No, keep it as "{status}"'
                values={{
                    status: toTitleCase(userStatus),
                }}
            />
        );

        const manualStatusCheckbox = (
            <FormattedMessage
                id='modal.manual_status.ask'
                defaultMessage='Do not ask me again'
            />
        );

        const showCheckbox = this.props.currentUserStatus !== UserStatuses.OUT_OF_OFFICE;

        return (
            <ConfirmModal
                show={this.state.show}
                title={manualStatusTitle}
                message={manualStatusMessage}
                confirmButtonText={manualStatusButton}
                onConfirm={this.onConfirm}
                cancelButtonText={manualStatusCancel}
                onCancel={this.onCancel}
                onExited={this.props.onHide}
                showCheckbox={showCheckbox}
                checkboxText={manualStatusCheckbox}
            />
        );
    }
}

t('modal.manual_status.auto_responder.message_');
t('modal.manual_status.auto_responder.message_away');
t('modal.manual_status.auto_responder.message_dnd');
t('modal.manual_status.auto_responder.message_offline');
t('modal.manual_status.auto_responder.message_online');
t('modal.manual_status.button_');
t('modal.manual_status.button_away');
t('modal.manual_status.button_dnd');
t('modal.manual_status.button_offline');
t('modal.manual_status.button_online');
t('modal.manual_status.cancel_');
t('modal.manual_status.cancel_away');
t('modal.manual_status.cancel_dnd');
t('modal.manual_status.cancel_offline');
t('modal.manual_status.cancel_ooo');
t('modal.manual_status.message_');
t('modal.manual_status.message_away');
t('modal.manual_status.message_dnd');
t('modal.manual_status.message_offline');
t('modal.manual_status.message_online');
t('modal.manual_status.title_');
t('modal.manual_status.title_away');
t('modal.manual_status.title_dnd');
t('modal.manual_status.title_offline');
t('modal.manual_status.title_ooo');
