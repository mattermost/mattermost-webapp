// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import GenericModal from 'components/generic_modal';
import UserSettingsModal from 'components/user_settings/modal';
import ReadReceiptsImage from 'images/read-receipts-modal-image.png';
import {ModalIdentifiers} from 'utils/constants';

type Props = {
    currentUserId: string;
    hasSeenModal: boolean;
    onHide: () => void;
    actions: {
        openModal: (modalData: { modalId: string; dialogType: any; dialogProps?: any }) => void;
    };
}

export default class ReadReceiptsModal extends React.PureComponent<Props> {
    handleGoToSettings = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
        });
    }

    render() {
        return (
            <GenericModal
                show={!this.props.hasSeenModal}
                onHide={this.props.onHide}
                modalHeaderText={(
                    <FormattedMessage
                        id={'read_receipts_modal.header'}
                        defaultMessage={'Read receipts are now available'}
                    />
                )}
                handleConfirm={() => {}}
                handleCancel={() => this.handleGoToSettings}
                confirmButtonText={(
                    <FormattedMessage
                        id={'read_receipts_modal.confirm'}
                        defaultMessage='Got it'
                    />
                )}
                cancelButtonText={(
                    <FormattedMessage
                        id={'read_receipts_modal.go_to_settings'}
                        defaultMessage='Go to Settings'
                    />
                )}
            >
                <span className='SidebarWhatsNewModal__helpText'>
                    <FormattedMessage
                        id={'read_receipts_modal.description'}
                        defaultMessage='Want to know if people have seen your messages? Read receipts are available for messages you send in Direct or Group Messages. Learn more (this should link to the docs page, URL tbd) about read receipts or disable them in Settings.'
                    />
                </span>
                <img src={ReadReceiptsImage}/>
            </GenericModal>
        );
    }
}
