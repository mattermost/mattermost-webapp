// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {closeModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';
import {t} from 'utils/i18n';

import CloudUsageModal from './index';


function openPricingModal(){};

export default function LHSNearingLimitsModal() {
    const dispatch = useDispatch();
    const product = useSelector(getCloudProduct);
product?.sku ===

    return (
        <CloudUsageModal
            title={{
                id: t('workspace_limits.modals.informational.title'),
                defaultMessage: '{planName} limits',
                values: {
                    planName: 'Cloud starter',
            },
            }}
            description={{
                id: t('workspace_limits.modals.informational.description.starterLimits'),
                defaultMessage: 'Cloud starter is restricted to {messages} message history, {storage}GB file storage, {integrations} apps, and {boards} board cards.',
            }}
            primaryAction={{
                message: {
                    id: t('workspace_limits.modals.view_plans'),
                    defaultMessage: 'View plans',
            },
            onClick: openPricingModal,
            }}
            secondaryAction={{
                message: {
                    id: t('workspace_limits.modals.close'),
                    defaultMessage: 'Close',
            },
            onClick: () => {
                dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
            },
            }}
            onClose={() => {
                dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
            }}
            />
    );
};
