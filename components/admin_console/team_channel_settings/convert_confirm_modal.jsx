// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

export default class ConvertConfirmModal extends React.PureComponent {
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
        isPublic: PropTypes.bool.isRequired,
    }

    render() {
        const {displayName, isPublic} = this.props;
        const newType = isPublic ? 'private' : 'public';
        const title = (
            <FormattedMessage
                id='admin.team_channel_settings.convertConfirmModal.title'
                defaultMessage='Convert {displayName} to a {newType} channel?'
                values={{displayName, newType}}
            />
        );

        const toPublicMsg = 'When you convert **{displayName}** to a public channel, history and membership are preserved. Public channels are discoverable and can by joined by users on the system without invitation.  \n \nAre you sure you want to convert **{displayName}** to a public channel?';
        const toPrivateMsg = 'When you convert **{displayName}** to a private channel, history and membership are preserved. Publicly shared files remain accessible to anyone with the link. Membership in a private channel is by invitation only.  \n \nAre you sure you want to convert **{displayName}** to a private channel?';
        const messageId = isPublic ? t('admin.team_channel_settings.convertConfirmModal.toPrivateMessage') :
            t('admin.team_channel_settings.convertConfirmModal.toPublicMessage');

        const message = (
            <FormattedMarkdownMessage
                id={messageId}
                defaultMessage={isPublic ? toPrivateMsg : toPublicMsg}
                values={{displayName}}
            />
        );

        const confirmButton = (
            <FormattedMessage
                id='admin.team_channel_settings.convertConfirmModal.convert'
                defaultMessage='Yes, convert to {newType} channel'
                values={{newType}}
            />
        );

        const cancelButton = (
            <FormattedMessage
                id='admin.team_channel_settings.convertConfirmModal.cancel'
                defaultMessage='No, cancel'
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
