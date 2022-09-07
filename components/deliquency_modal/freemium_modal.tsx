// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {t, Message} from 'utils/i18n';
import CloudUsageModal from 'components/cloud_usage_modal';
import useGetHighestThresholdCloudLimit from 'components/common/hooks/useGetHighestThresholdCloudLimit';
import {TELEMETRY_CATEGORIES} from 'utils/constants';
import {trackEvent} from 'actions/telemetry_actions';

import './deliquency_modal.scss';

type FreemiumModalProps = {
    onClose: () => void;
    onExited: () => void;
    planName: string;
    isAdminConsole?: boolean;
}

export const FreemiumModal = ({onClose, onExited, planName, isAdminConsole}: FreemiumModalProps) => {
    const openPurchaseModal = useOpenCloudPurchaseModal({isDelinquencyModal: true});
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    useSelector(getTheme);
    const highestLimit = useGetHighestThresholdCloudLimit(usage, limits);

    const handleClose = () => {
        onClose();
        onExited();
    };

    const handleReactivate = () => {
        handleClose();
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'clicked_re_activate_plan');
        openPurchaseModal({trackingLocation: 'deliquency_modal_freemium_admin'});
    };

    const title: Message = {
        id: t('cloud_delinquency.modal.workspace_downgraded_freemium_title'),
        defaultMessage: 'You now have data limits on your plan',
    };

    if (!highestLimit) {
        const secondaryAction = {
            message: {
                id: t('cloud_delinquency.modal.stay_on_freemium_close'),
                defaultMessage: 'View plans',
            },
            onClick: handleClose,
        };

        const description = (<>
            <FormattedMessage
                id='cloud_delinquency.modal.workspace_downgraded_freemium'
                defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
            >
                {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
            </FormattedMessage>
            <FormattedMessage
                id='cloud_delinquency.modal.workspace_downgraded_freemium_limits'
                defaultMessage='Free plan limits'
            >
                {(text) => <span className='DeliquencyModal__body__subheader'>{text}</span>}
            </FormattedMessage>
        </>);

        return (
            <CloudUsageModal
                className='DeliquencyModal'
                secondaryAction={secondaryAction}
                title={title}
                description={description}
                onClose={handleClose}
            />);
    }

    const secondaryAction = {
        message: {
            id: t('cloud_delinquency.modal.stay_on_freemium'),
            defaultMessage: 'Stay on Starter (Free Plan)',
        },
        onClick: handleClose,
    };

    const primaryAction = {
        message: {
            id: t('cloud_delinquency.modal.update_billing'),
            defaultMessage: 'Re-activate {planName}',
            values: {
                planName,
            },
        },
        onClick: handleReactivate,
    };

    const description = (<>
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_freemium'
            defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_freemium_limits'
            defaultMessage='Free plan limits'
        >
            {(text) => <span className='DeliquencyModal__body__subheader'>{text}</span>}
        </FormattedMessage>
    </>);

    return (
        <CloudUsageModal
            className='DeliquencyModal'
            title={title}
            description={description}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            onClose={handleClose}
            needsTheme={isAdminConsole}
        />
    );
};
