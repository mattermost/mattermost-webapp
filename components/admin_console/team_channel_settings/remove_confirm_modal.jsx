// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal.jsx';

export default class RemoveConfirmModal extends React.PureComponent {
    static propTypes = {

        /*
         * Bool whether the modal is shown
         */
        show: PropTypes.bool.isRequired,

        /*
         * Action to call on confirm
         */
        onConfirm: PropTypes.func.isRequired,

        /*
         * Action to call on cancel
         */
        onCancel: PropTypes.func.isRequired,

        /*
         * Indicates if the message is for removal from channel or team
         */
        inChannel: PropTypes.bool.isRequired,

        /*
         * Number of users to be removed
         */
        amount: PropTypes.number.isRequired,

    }

    render() {
        const {amount, inChannel} = this.props;
        const title = (
            <FormattedMessage
                id='admin.team_channel_settings.removeConfirmModal.title'
                defaultMessage='Save and remove {amount, number} {amount, plural, one {user} other {users}}?'
                values={{amount}}
            />
        );

        const message = (
            <FormattedMessage
                id='admin.team_channel_settings.removeConfirmModal.message'
                defaultMessage='{amount, number} {amount, plural, one {user} other {users}} will be removed on the next AD/LDAP synchronization. They are not in groups linked to this {type}. Are you sure you wish to remove these users?'
                values={{amount, type: inChannel ? 'channel' : 'group'}}
            />
        );

        const buttonClass = 'btn btn-primary';
        const button = (
            <FormattedMessage
                id='admin.team_channel_settings.removeConfirmModal.remove'
                defaultMessage='Save and Remove Users'
            />
        );

        const modalClass = 'discard-changes-modal';

        const {show, onConfirm, onCancel} = this.props;

        return (
            <ConfirmModal
                show={show}
                title={title}
                message={message}
                modalClass={modalClass}
                confirmButtonClass={buttonClass}
                confirmButtonText={button}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
    }
}
