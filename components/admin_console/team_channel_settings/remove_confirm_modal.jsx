// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n.jsx';
import ConfirmModal from 'components/confirm_modal';

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

        const messageId = inChannel ? t('admin.team_channel_settings.removeConfirmModal.messageGroup') : t('admin.team_channel_settings.removeConfirmModal.messageChannel');
        const messageChannel = '{amount, number} {amount, plural, one {user} other {users}} will be removed. They are not in groups linked to this channel. Are you sure you wish to remove these users?';
        const messageGroup = '{amount, number} {amount, plural, one {user} other {users}} will be removed. They are not in groups linked to this group. Are you sure you wish to remove these users?';

        const message = (
            <FormattedMessage
                id={messageId}
                defaultMessage={inChannel ? messageChannel : messageGroup}
                values={{amount}}
            />
        );

        const buttonClass = 'btn btn-primary';
        const button = (
            <FormattedMessage
                id='admin.team_channel_settings.removeConfirmModal.remove'
                defaultMessage='Save and remove {amount, plural, one {user} other {users}}'
                values={{amount}}
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
