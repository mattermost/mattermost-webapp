// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useIntl} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

import {closeModal} from 'actions/views/modals';

import {ModalIdentifiers, CloudProducts} from 'utils/constants';
import {t, Message} from 'utils/i18n';
import {fallbackStarterLimits, asGBString} from 'utils/limits';

import useGetHighestThresholdCloudLimit, {LimitTypes} from 'components/common/hooks/useGetHighestThresholdCloudLimit';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';

import CloudUsageModal from './index';

function openPricingModal() {}

export default function LHSNearingLimitsModal() {
    const dispatch = useDispatch();
    const product = useSelector(getSubscriptionProduct);
    const usage = useGetUsage();
    const intl = useIntl();

    const [limits] = useGetLimits();

    const primaryAction = {
        message: {
            id: t('workspace_limits.modals.view_plans'),
            defaultMessage: 'View plans',
        },
        onClick: openPricingModal,
    };
    const secondaryAction = {
        message: {
            id: t('workspace_limits.modals.close'),
            defaultMessage: 'Close',
        },
        onClick: () => {
            dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
        },
    };
    const highestLimit = useGetHighestThresholdCloudLimit(usage, limits);
    let title: Message = {
        id: t('workspace_limits.modals.informational.title'),
        defaultMessage: '{planName} limits',
        values: {
            planName: product?.name,
        },
    };

    let description: Message = {
        id: t('workspace_limits.modals.informational.description.starterLimits'),
        defaultMessage: '{planName} is restricted to {messages} message history, {storage} file storage, {integrations} apps, and {boards} board cards.',
        values: {
            planName: product?.name,
            messages: intl.formatNumber(limits?.messages?.history ?? fallbackStarterLimits.messages.history),
            storage: asGBString(limits?.files?.total_storage ?? fallbackStarterLimits.files.totalStorage, intl.formatNumber),
            integrations: limits?.integrations?.enabled ?? fallbackStarterLimits.integrations.enabled,
            boards: limits?.boards?.cards ?? fallbackStarterLimits.boards.cards,
        },
    };
    if (product?.sku === CloudProducts.PROFESSIONAL) {
        description = {
            id: t('workspace_limits.modals.informational.description.professionalLimits'),
            defaultMessage: '{planName} is restricted to {storage} file storage.',
            values: {
                planName: product.name,
                storage: asGBString(limits?.files?.total_storage ?? fallbackStarterLimits.files.totalStorage, intl.formatNumber),
            },
        };
    }

    if (highestLimit && highestLimit.id === LimitTypes.messageHistory) {
        title = {
            id: t('workspace_limits.modals.limits_reached.title.message_history'),
            defaultMessage: 'Message history',
        };

        description = {
            id: t('workspace_limits.modals.limits_reached.description.message_history'),
            defaultMessage: 'Your sent message history is no longer available but you can still send messages. Upgrade to a paid plan and get unlimited access to your message history.',
        };
    }

    return (
        <CloudUsageModal
            title={title}
            description={description}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            onClose={() => {
                dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
            }}
        />
    );
}
