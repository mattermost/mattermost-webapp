// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getCloudProduct} from 'mattermost-redux/selectors/entities/cloud';

import useGetHighestThresholdCloudLimit, {LimitTypes} from 'components/common/hooks/useGetHighestThresholdCloudLimit';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';

import {closeModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';
import {t, Message} from 'utils/i18n';

import CloudUsageModal from './index';

function openPricingModal() {}

export default function LHSNearingLimitsModal() {
    const dispatch = useDispatch();
    const product = useSelector(getCloudProduct);
    const usage = useGetUsage();
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
        defaultMessage: 'Cloud starter is restricted to {messages} message history, {storage}GB file storage, {integrations} apps, and {boards} board cards.',
    };

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
