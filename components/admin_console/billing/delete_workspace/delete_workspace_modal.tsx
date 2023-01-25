// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { GenericModal } from '@mattermost/components';
import React from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import LaptopAlertSVG from 'components/common/svg_images_components/laptop_alert_svg';
import {closeModal, openModal} from 'actions/views/modals';
import {getIsStarterLicense} from 'utils/license_utils';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {useDispatch, useSelector} from 'react-redux';

import './delete_workspace_modal.scss'
import { ModalIdentifiers } from 'utils/constants';
import FeedbackModal from 'components/feedback_modal';

type Props = WrappedComponentProps

const DeleteWorkspaceModal = (props: Props) => {
    const dispatch = useDispatch();

    const license = useSelector(getLicense);
    const isStarter = getIsStarterLicense(license);

    const feedbackModalTitle = props.intl.formatMessage({
        id:'admin.billing.subscription.deleteWorkspace.feedbackTitle',
        defaultMessage:'Please share your reason for deleting'
    });

    const placeHolder = props.intl.formatMessage({
        id: 'admin.billing.subscription.deleteWorkspace.feedbackPlaceholder',
        defaultMessage: 'Please tell us why you are deleting'
    });

    const submitText = props.intl.formatMessage({
        id: 'admin.billing.subscription.deleteWorkspace.submitText',
        defaultMessage: 'Delete Workspace'
    })

    const feedbackOptions = [
        props.intl.formatMessage({
            id: 'admin.billing.subscription.deleteWorkspace.feedbackNoValue',
            defaultMessage: 'No longer found value',
        }),
        props.intl.formatMessage({
            id: 'admin.billing.subscription.deleteWorkspace.feedbackMoving',
            defaultMessage: 'Moving to a different solution',
        }),
        props.intl.formatMessage({
            id: 'admin.billing.subscription.deleteWorkspace.feedbackMistake',
            defaultMessage: 'Created a workspace by mistake',
        }),
        props.intl.formatMessage({
            id: 'admin.billing.subscription.deleteWorkspace.feedbackHosting',
            defaultMessage: 'Moving to hosting my own Mattermost instance (self-hosted)',
        }),
    ]

    const handleDeleteWorkspace = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.FEEDBACK,
            dialogType: FeedbackModal,
            dialogProps: {
                onSubmit: deleteWorkspace,
                title: feedbackModalTitle,
                submitText: submitText,
                feedbackOptions: feedbackOptions,
                freeformTextPlaceholder: placeHolder
            }
        }));
    }

    const handleDowngradeWorkspace = () => {

    };

    const handleCancel = () => {
        dispatch(closeModal(ModalIdentifiers.DELETE_WORKSPACE));
        dispatch(closeModal(ModalIdentifiers.FEEDBACK));
    };

    const deleteWorkspace = () => {
        console.log("deleted!");
    };

    return (
        <GenericModal
            className='DeleteWorkspaceModal'
            onExited={handleCancel}
        >
            <div>
                <LaptopAlertSVG/>
            </div>
            <div className='DeleteWorkspaceModal__Title'>
                <FormattedMessage
                    id='admin.billing.subscription.deleteWorkspaceModal.title'
                    defaultMessage='Are you sure you want to delete?'
                />
            </div>
            <div className='DeleteWorkspaceModal__Usage'>
                <FormattedMessage
                    id='admin.billing.subscription.deleteWorkspaceModal.usage'
                    defaultMessage='As part of your paid subscription to Mattermost Cloud Professional you have created '
                />
                <span className='DeleteWorkspaceModal__Usage-Highlighted'>
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceModal.usageDetails'
                        defaultMessage='{messageCount} messages, {fileSize} of files, {cardCount} cards and {integrationsCount} integrations.'
                        values={{
                            messageCount: 1000,
                            fileSize: '24GB',
                            cardCount: 100,
                            integrationsCount: 10,
                        }}
                    />
                </span>
            </div>
            <div className='DeleteWorkspaceModal__Warning'>
                <FormattedMessage
                    id='admin.billing.subscription.deleteWorkspaceModal.warning'
                    defaultMessage="Deleting your workspace is final. Upon deleting, you'll lose all of the above with no ability to recover. If you downgrade to Free, you will not lose this information."
                />
            </div>
            <div className='DeleteWorkspaceModal__Buttons'>
                <button
                    className='btn DeleteWorkspaceModal__Buttons-Delete'
                    onClick={handleDeleteWorkspace}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceModal.deleteButton'
                        defaultMessage='Delete Workspace'
                    />
                </button>
                {!isStarter ? <button
                    className='btn DeleteWorkspaceModal__Buttons-Downgrade'
                    onClick={handleDowngradeWorkspace}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceModal.downgradeButton'
                        defaultMessage='Downgrade To Free'
                    />
                </button>: <></>}
                <button
                    className='btn btn-primary DeleteWorkspaceModal__Buttons-Cancel'
                    onClick={handleCancel}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceModal.cancelButton'
                        defaultMessage='Keep Subscription'
                    />
                </button>
            </div>
        </GenericModal>
    )
}

export default injectIntl(DeleteWorkspaceModal);