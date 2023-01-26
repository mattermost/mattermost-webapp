// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericModal} from '@mattermost/components';
import React from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import LaptopAlertSVG from 'components/common/svg_images_components/laptop_alert_svg';
import {closeModal, openModal} from 'actions/views/modals';
import {getIsStarterLicense} from 'utils/license_utils';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {useDispatch, useSelector} from 'react-redux';

import './delete_workspace_modal.scss'
import {CloudProducts, ModalIdentifiers, StatTypes} from 'utils/constants';
import DeleteFeedbackModal from 'components/feedback_modal/delete_feedback';
import DowngradeFeedbackModal from 'components/feedback_modal/downgrade_feedback';
import {Feedback} from '@mattermost/types/cloud';
import {GlobalState} from 'types/store';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {fileSizeToString} from 'utils/utils';
import useOpenDowngradeModal from 'components/common/hooks/useOpenDowngradeModal';
import {subscribeCloudSubscription, deleteWorkspace as deleteWorkspaceRequest} from 'actions/cloud';
import DeleteWorkspaceSuccessModal from 'components/admin_console/billing/delete_workspace/success_modal';
import ErrorModal from 'components/cloud_subscribe_result_modal/error';
import DeleteWorkspaceProgressModal from 'components/admin_console/billing/delete_workspace/progress_modal';
import SuccessModal from 'components/cloud_subscribe_result_modal/success';

type Props = {
    callerCTA: string;
} & WrappedComponentProps

const DeleteWorkspaceModal = (props: Props) => {
    const dispatch = useDispatch();
    const license = useSelector(getLicense);
    const openDowngradeModal = useOpenDowngradeModal();
    
    const isStarter = getIsStarterLicense(license);
    const usage = useGetUsage();

    const starterProduct = useSelector((state: GlobalState) => {
        return Object.values(state.entities.cloud.products || {}).find((product) => {
            return product.sku === CloudProducts.STARTER;

        });
    });

    const totalFileSize = fileSizeToString(usage.files.totalStorage)
    const totalBoardsCards = usage.boards.cards
    const totalMessages = useSelector((state: GlobalState) => {
        if (!state.entities.admin.analytics) {
            return 0;
        } 
        return state.entities.admin.analytics[StatTypes.TOTAL_POSTS];
    });
    const totalIntegrations = useSelector((state: GlobalState) => {
        // TODO: How to get integrations?
    })

    const handleDeleteWorkspace = () => {
        dispatch(closeModal(ModalIdentifiers.DELETE_WORKSPACE));
        dispatch(openModal({
            modalId: ModalIdentifiers.FEEDBACK,
            dialogType: DeleteFeedbackModal,
            dialogProps: {
                onSubmit: deleteWorkspace,
            },
        }));
    }

    const handleDowngradeWorkspace = () => {
        dispatch(closeModal(ModalIdentifiers.DELETE_WORKSPACE));
        dispatch(openModal({
            modalId: ModalIdentifiers.FEEDBACK,
            dialogType: DowngradeFeedbackModal,
            dialogProps: {
                onSubmit: downgradeWorkspace,
            },
        }));
    };

    const handleCancel = () => {
        dispatch(closeModal(ModalIdentifiers.DELETE_WORKSPACE));
        dispatch(closeModal(ModalIdentifiers.FEEDBACK));
    };

    const deleteWorkspace = async (feedback: Feedback) => {
        dispatch(openModal({
            modalId: ModalIdentifiers.DELETE_WORKSPACE_PROGRESS,
            dialogType: DeleteWorkspaceProgressModal,
        }));

        const result = await dispatch(deleteWorkspaceRequest());

        if (typeof result === 'boolean' && result) {
            dispatch(closeModal(ModalIdentifiers.DOWNGRADE_MODAL));
            dispatch(openModal({
                modalId: ModalIdentifiers.SUCCESS_MODAL,
                dialogType: DeleteWorkspaceSuccessModal,
            }));
        } else {

        }

        console.log("deleted! Feedback: ", JSON.stringify(feedback));
    };

    const downgradeWorkspace = async (feedback: Feedback) => {
        if (!starterProduct) {
            return;
        }

        console.log("downgraded! Feedback: ", JSON.stringify(feedback));
        const telemetryInfo = props.callerCTA + ' > ' + 'delete_workspace_modal';
        openDowngradeModal({trackingLocation: telemetryInfo});

        const result = await dispatch(subscribeCloudSubscription(starterProduct.id));

        if (typeof result === 'boolean' && result) {
            dispatch(closeModal(ModalIdentifiers.DOWNGRADE_MODAL));
            dispatch(
                openModal({
                    modalId: ModalIdentifiers.SUCCESS_MODAL,
                    dialogType: SuccessModal,
                }),
            );
        } else {
            dispatch(closeModal(ModalIdentifiers.DOWNGRADE_MODAL));
            dispatch(
                openModal({
                    modalId: ModalIdentifiers.ERROR_MODAL,
                    dialogType: ErrorModal,
                    dialogProps: {
                        backButtonAction: () => {
                            dispatch(openModal({
                                modalId: ModalIdentifiers.DELETE_WORKSPACE,
                                dialogType: DeleteWorkspaceModal,
                                dialogProps: {
                                    callerCTA: props.callerCTA,
                                    intl: props.intl,
                                }
                            }));
                        },
                    },
                }),
            );
        }
    }

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
                            messageCount: totalMessages,
                            fileSize: totalFileSize,
                            cardCount: totalBoardsCards,
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