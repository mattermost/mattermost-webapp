// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect, useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import {GlobalState} from 'types/store';
import {subscribeCloudSubscription} from 'actions/cloud';
import {closeModal} from 'actions/views/modals';
import {Team} from '@mattermost/types/teams';
import {Product} from '@mattermost/types/cloud';
import {t} from 'utils/i18n';
import {isModalOpen} from 'selectors/views/modals';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import CreditCardSvg from 'components/common/svg_images_components/credit_card_svg';
import PaymentSuccessStandardSvg from 'components/common/svg_images_components/payment_success_standard_svg';
import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed_svg';
import IconMessage from 'components/purchase_modal/icon_message';
import ProgressBar, {ProcessState} from 'components/icon_message_with_progress_bar';
import {
    selectTeam,
    archiveAllTeamsExcept,
} from 'mattermost-redux/actions/teams';

type Props = RouteComponentProps & {
    onBack: () => void;
    onClose?: () => void;
    teamToKeep?: Team;
    selectedProduct?: Product | null | undefined;
};

const MIN_PROCESSING_MILLISECONDS = 8000;
const MAX_FAKE_PROGRESS = 95;

function CloudSubscribeWithLoad(props: Props) {
    let intervalId: NodeJS.Timeout;
    const progress = useRef(0);
    const dispatch = useDispatch();
    const [error, setError] = useState(false);
    const [processingState, setProcessingState] = useState(ProcessState.PROCESSING);
    const modalOpen = useSelector((state: GlobalState) =>
        isModalOpen(state, ModalIdentifiers.CLOUD_SUBSCRIBE_WITH_LOADING_MODAL),
    );
    useEffect(() => {
        intervalId = {} as NodeJS.Timeout;

        handleSubscribe();
        intervalId = setInterval(
            updateProgress,
            MIN_PROCESSING_MILLISECONDS / MAX_FAKE_PROGRESS,
        );
    }, []);

    const handleSubscribe = async () => {
        const start = new Date();

        if (props.teamToKeep) {
            await dispatch(selectTeam(props.teamToKeep?.id));
            await dispatch(archiveAllTeamsExcept(props.teamToKeep.id));
        }

        const productUpdated = await dispatch(subscribeCloudSubscription(
            props.selectedProduct?.id as string,
        ));

        // the action subscribeCloudSubscription returns a true boolean when successful and an error when it fails
        if (typeof productUpdated !== 'boolean') {
            setError(true);
            setProcessingState(ProcessState.FAILED);
            return;
        }

        const end = new Date();
        const millisecondsElapsed = end.valueOf() - start.valueOf();
        if (millisecondsElapsed < MIN_PROCESSING_MILLISECONDS) {
            setTimeout(
                completeSubscribe,
                MIN_PROCESSING_MILLISECONDS - millisecondsElapsed,
            );
            return;
        }
        completeSubscribe();
    };

    const completeSubscribe = () => {
        clearInterval(intervalId);
        setProcessingState(ProcessState.SUCCESS);
        progress.current = 100;
    };

    const updateProgress = () => {
        if (progress.current >= MAX_FAKE_PROGRESS) {
            clearInterval(intervalId);
            return;
        }
        progress.current =
            progress.current + 3 > MAX_FAKE_PROGRESS ? MAX_FAKE_PROGRESS : progress.current + 3;
    };

    const handleGoBack = () => {
        clearInterval(intervalId);
        progress.current = 0;
        setError(false);
        setProcessingState(ProcessState.PROCESSING);
        props.onBack();
    };

    const handleClose = () => {
        dispatch(
            closeModal(
                ModalIdentifiers.CLOUD_SUBSCRIBE_WITH_LOADING_MODAL,
            ),
        );
        if (typeof props.onClose === 'function') {
            props.onClose();
        }
    };

    const successPage = () => {
        const formattedBtnText = (
            <FormattedMessage
                defaultMessage='Return to {team}'
                id='admin.billing.subscription.returnToTeam'
                values={{team: props.teamToKeep?.display_name}}
            />
        );
        const productName = props.selectedProduct?.name;
        const title = (
            <FormattedMessage
                id={'admin.billing.subscription.downgradedSuccess'}
                defaultMessage={"You're now subscribed to {productName}"}
                values={{productName}}
            />
        );

        const formattedSubtitle = (
            <FormattedMessage
                id='success_modal.subtitle'
                defaultMessage='Your final bill will be prorated. Your workspace now has {productName} limits'
                values={{productName}}
            />
        );
        return (
            <IconMessage
                formattedTitle={title}
                formattedSubtitle={formattedSubtitle}
                error={error}
                icon={
                    <PaymentSuccessStandardSvg
                        width={444}
                        height={313}
                    />
                }
                formattedButtonText={formattedBtnText}
                buttonHandler={handleClose}
                className={'success'}
                tertiaryBtnText={t('admin.billing.subscription.viewBilling')}
                tertiaryButtonHandler={() => {
                    handleClose();
                    props.history.push('/admin_console/billing/subscription');
                }}
            />
        );
    };

    return (
        <FullScreenModal
            show={modalOpen}
            onClose={handleClose}
        >
            <div className='loading-modal'>
                <ProgressBar
                    processingState={processingState}
                    processingCopy={{
                        title: t('admin.billing.subscription.downgrading'),
                        subtitle: '',
                        icon: (
                            <CreditCardSvg
                                width={444}
                                height={313}
                            />
                        ),
                    }}
                    failedCopy={{
                        title: t('admin.billing.subscription.paymentVerificationFailed'),
                        subtitle: t('admin.billing.subscription.paymentFailed'),
                        icon: (
                            <PaymentFailedSvg
                                width={444}
                                height={313}
                            />
                        ),
                        buttonText: t('admin.billing.subscription.goBackTryAgain'),
                        linkText:
                            t('admin.billing.subscription.constCloudCard.contactSupport'),
                    }}
                    progress={progress}
                    successPage={successPage}
                    handleGoBack={handleGoBack}
                    error={error}
                />
            </div>
        </FullScreenModal>
    );
}

export default withRouter(CloudSubscribeWithLoad);
