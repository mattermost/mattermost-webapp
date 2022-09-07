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
import useGetMultiplesExceededCloudLimit, {LimitTypes} from 'components/common/hooks/useGetMultiplesExceededCloudLimit';
import {TELEMETRY_CATEGORIES} from 'utils/constants';
import {trackEvent} from 'actions/telemetry_actions';

import './deliquency_modal.scss';

type FreemiumModalProps = {
    onClose: () => void;
    onExited: () => void;
    planName: string;
    isAdminConsole?: boolean;
}

type ValueOf<T> = T[keyof T];

type DescriptionStatusKey = ValueOf<typeof LimitTypes> | 'noLimits' | 'multipleLimits';

const DescriptionMessages: Record<DescriptionStatusKey, JSX.Element> = {
    noLimits: (
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_freemium'
            defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
    ),
    [LimitTypes.messageHistory]: (
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_messages_surpassed'
            defaultMessage='Older messages will no longer be accessable, but you can continue sending new messages. Upgrade to one of our paid plans.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
    ),
    [LimitTypes.enabledIntegrations]: (
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_integrations_surpassed'
            defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
    ),
    [LimitTypes.fileStorage]: (
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_storage_surpassed'
            defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
    ),
    [LimitTypes.boardsCards]: (
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_boards_surpassed'
            defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
    ),
    multipleLimits: (
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_multiples_limits_surpassed'
            defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
        >
            {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
        </FormattedMessage>
    ),
};

const getDescriptionKey = (limits: Array<ValueOf<typeof LimitTypes>>): DescriptionStatusKey => {
    if (limits.length > 1) {
        return 'multipleLimits';
    }

    if (limits.length === 1) {
        return limits[0];
    }

    return 'noLimits';
};

export const FreemiumModal = ({onClose, onExited, planName, isAdminConsole}: FreemiumModalProps) => {
    const openPurchaseModal = useOpenCloudPurchaseModal({isDelinquencyModal: true});
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    useSelector(getTheme);
    const limitsSurpassed = useGetMultiplesExceededCloudLimit(usage, limits);

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

    const description = (<>
        {DescriptionMessages[getDescriptionKey(limitsSurpassed)]}
        <FormattedMessage
            id='cloud_delinquency.modal.workspace_downgraded_freemium_limits'
            defaultMessage='Free plan limits'
        >
            {(text) => <span className='DeliquencyModal__body__subheader'>{text}</span>}
        </FormattedMessage>
    </>);

    if (limitsSurpassed.length === 0) {
        const secondaryAction = {
            message: {
                id: t('cloud_delinquency.modal.stay_on_freemium_close'),
                defaultMessage: 'View plans',
            },
            onClick: handleClose,
        };

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
