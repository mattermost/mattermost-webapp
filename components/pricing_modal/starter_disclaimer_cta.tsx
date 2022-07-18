// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {Product} from '@mattermost/types/cloud';

import {getCloudProducts} from 'mattermost-redux/selectors/entities/cloud';

import {openModal, closeModal} from 'actions/views/modals';
import CloudUsageModal from 'components/cloud_usage_modal';

import {CloudProducts, ModalIdentifiers} from 'utils/constants';
import {fallbackStarterLimits, asGBString} from 'utils/limits';
import {t} from 'utils/i18n';

const Disclaimer = styled.div`
margin-top: 36px;
color: var(--error-text);
font-family: 'Open Sans';
font-size: 12px;
font-style: normal;
font-weight: 600;
line-height: 16px;
cursor: pointer;
`;

function StarterDisclaimerCTA() {
    const intl = useIntl();
    const dispatch = useDispatch();
    const products = useSelector(getCloudProducts);
    const starterProductName = Object.values(products || {})?.find((product: Product) => product?.sku === CloudProducts.STARTER)?.name || 'Cloud Starter';

    const openLimitsMiniModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_LIMITS,
            dialogType: CloudUsageModal,
            dialogProps: {
                backdropClassName: 'cloud-usage-backdrop',
                title: {
                    id: t('workspace_limits.modals.informational.title'),
                    defaultMessage: '{planName} limits',
                    values: {
                        planName: starterProductName,
                    },
                },
                description: {
                    id: t('workspace_limits.modals.informational.description.starterLimits'),
                    defaultMessage: '{planName} is restricted to {messages} message history, {storage} file storage, {boards} board cards, and {integrations} integrations.',
                    values: {
                        planName: starterProductName,
                        messages: intl.formatNumber(fallbackStarterLimits.messages.history),
                        storage: asGBString(fallbackStarterLimits.files.totalStorage, intl.formatNumber),
                        integrations: fallbackStarterLimits.integrations.enabled,
                        boards: fallbackStarterLimits.boards.cards,
                    },
                },
                secondaryAction: {
                    message: {
                        id: t('workspace_limits.modals.close'),
                        defaultMessage: 'Close',
                    },
                    onClick: () => {
                        dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                    },
                },
                onClose: () => {
                    dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                },
                ownLimits: {
                    messages: {
                        history: fallbackStarterLimits.messages.history,
                    },
                    files: {
                        total_storage: fallbackStarterLimits.files.totalStorage,
                    },
                    boards: {
                        cards: fallbackStarterLimits.boards.cards,
                        views: fallbackStarterLimits.boards.views,
                    },
                    integrations: {
                        enabled: fallbackStarterLimits.integrations.enabled,
                    },
                },
                needsTheme: true,
            },
        }));
    };
    return (
        <Disclaimer
            id='starter_plan_data_restrictions_cta'
            onClick={openLimitsMiniModal}
        >
            <i className='icon-alert-outline'/>
            {intl.formatMessage({id: 'pricing_modal.planDisclaimer.starter', defaultMessage: 'This plan has data restrictions.'})}
        </Disclaimer>);
}

export default StarterDisclaimerCTA;
