// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

import RemoveConfirmModal from './remove_confirm_modal';
import ConvertConfirmModal from './convert_confirm_modal';

export default class UpdateConfirmModal extends React.PureComponent {
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
         * Channel display name
         */
        displayName: PropTypes.string.isRequired,

        /*
         * Channel public/private state
         */
        toPublic: PropTypes.bool.isRequired,

        /*
         * Indicates if the channel privacy is being updated
         */
        isPrivacyChanging: PropTypes.bool.isRequired,

        /*
         * Number of users to be removed
         */
        removeAmount: PropTypes.number.isRequired,
    }

    render() {
        const {show, onConfirm, onCancel, displayName, isPrivacyChanging, toPublic, removeAmount} = this.props;

        if (isPrivacyChanging && removeAmount === 0) {
            return (
                <ConvertConfirmModal
                    show={show}
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                    displayName={displayName}
                    isPublic={!toPublic}
                />
            );
        }

        if (!isPrivacyChanging && removeAmount > 0) {
            return (
                <RemoveConfirmModal
                    amount={removeAmount}
                    inChannel={true}
                    show={show}
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                />
            );
        }

        const newType = toPublic ? 'public' : 'private';
        const toPublicMsg = 'When you convert **{displayName}** to a public channel, history and membership are preserved. Public channels are discoverable and can by joined by users on the system without invitation.  \n \nAre you sure you want to convert **{displayName}** to a public channel?';
        const toPrivateMsg = 'When you convert **{displayName}** to a private channel, history and membership are preserved. Publicly shared files remain accessible to anyone with the link. Membership in a private channel is by invitation only.  \n \nAre you sure you want to convert **{displayName}** to a private channel?';
        const messageId = toPublic ? t('admin.team_channel_settings.convertConfirmModal.toPublicMessage') :
            t('admin.team_channel_settings.convertConfirmModal.toPrivateMessage');

        const title = (
            <FormattedMessage
                id='admin.team_channel_settings.updateConfirmModal.title'
                defaultMessage='Convert {displayName} to a {newType} channel and remove {amount, number} {amount, plural, one {user} other {users}}?'
                values={{displayName, newType, amount: removeAmount}}
            />
        );

        const message = (
            <div>
                <p>
                    <FormattedMarkdownMessage
                        id={messageId}
                        defaultMessage={toPublic ? toPublicMsg : toPrivateMsg}
                        values={{displayName}}
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='admin.team_channel_settings.removeConfirmModal.message'
                        defaultMessage='{amount, number} {amount, plural, one {user} other {users}} will be removed on the next AD/LDAP synchronization. They are not in groups linked to this {type}. Are you sure you wish to remove these users?'
                        values={{amount: removeAmount, type: 'channel'}}
                    />
                </p>
            </div>
        );

        const confirmButton = (
            <FormattedMessage
                id='admin.team_channel_settings.updateConfirmModal.update'
                defaultMessage='Yes, convert channel to {newType} and remove {amount, number} {amount, plural, one {user} other {users}}'
                values={{newType, amount: removeAmount}}
            />
        );

        const cancelButton = (
            <FormattedMessage
                id='admin.team_channel_settings.updateConfirmModal.cancel'
                defaultMessage='No, cancel'
            />
        );

        const modalClass = 'discard-changes-modal';

        return (
            <ConfirmModal
                show={show}
                title={title}
                message={message}
                modalClass={modalClass}
                confirmButtonClass={'btn btn-primary'}
                confirmButtonText={confirmButton}
                cancelButtonClass={'bnt bnt-link'}
                cancelButtonText={cancelButton}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
    }
}
