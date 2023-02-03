// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';

import {openModal as openModalAction} from 'actions/views/modals';

import ConfirmModalRedux from 'components/confirm_modal_redux';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

const ModalId = 'disable_integration_confirm';

type Props = {
    confirmButtonText?: React.ReactNode;
    linkText?: React.ReactNode;
    modalMessage?: React.ReactNode;
    modalTitle?: React.ReactNode;
    onConfirm: () => void;
    openModal: typeof openModalAction;
};

export default function DisableIntegrationLink(props: Props) {
    const {
        confirmButtonText = (
            <FormattedMessage
                id='integrations.disable.confirm.button'
                defaultMessage='Disable'
            />
        ),
        linkText = (
            <FormattedMessage
                id='installed_integrations.disable'
                defaultMessage='Disable'
            />
        ),
        modalMessage,
        modalTitle = (
            <FormattedMessage
                id='integrations.Disable.confirm.title'
                defaultMessage='Disable Integration'
            />
        ),
        onConfirm,
        openModal,
    } = props;

    const onClick = useCallback(() => {
        openModal({
            modalId: ModalId,
            dialogProps: {
                confirmButtonText,
                message: (
                    <div className='alert alert-warning'>
                        <WarningIcon additionalClassName='mr-1'/>
                        {props.modalMessage}
                    </div>
                ),
                onConfirm,
                title: modalTitle,
            },
            dialogType: ConfirmModalRedux,
        });
    }, [confirmButtonText, modalMessage, modalTitle, onConfirm, openModal]);

    return (
        <button
            className='color--link style--none'
            onClick={onClick}
        >
            {linkText}
        </button>
    );
}
