// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';

import {openModal, closeModal} from 'actions/views/modals';
import CloudUsageModal from 'components/cloud_usage_modal';

import {ModalIdentifiers} from 'utils/constants';
import {FileSizes} from 'utils/file_utils';
import {t} from 'utils/i18n';

import PricingModal from '.';

const STARTER_MESSAGES_LIMIT = 10000;
const STARTER_FILE_STORAGE_LIMIT = 10;
const STARTER_BOARDS_VIEW_LIMIT = 500;
const STARTER_BOARD_CARDS_LIMIT = 500;
const STARTER_INTEGRATIONS_LIMIT = 5;

const DisClaimer = styled.div`
margin-top: 36px;
color: var(--error-text);
font-family: 'Open Sans';
font-size: 12px;
font-style: normal;
font-weight: 600;
line-height: 16px;
cursor: pointer;
`;

function StarterDisclaimer() {
    const intl = useIntl();
    const dispatch = useDispatch();

    const openPricingModal = () => {
        dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
        dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
    };

    const openLimitsMiniModal = () => {
        dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_LIMITS,
            dialogType: CloudUsageModal,
            dialogProps: {
                title: {
                    id: t('workspace_limits.modals.informational.title'),
                    defaultMessage: '{planName} limits',
                    values: {
                        planName: 'Cloud starter',
                    },
                },
                description: {
                    id: t('workspace_limits.modals.informational.description.fre'),
                    defaultMessage: 'Cloud starter is restricted to 10,000 message history, 10GB file storage, 5 apps, and 500 board cards.',
                },
                primaryAction: {
                    message: {
                        id: t('workspace_limits.modals.view_plans'),
                        defaultMessage: 'View plans',
                    },
                    onClick: openPricingModal,
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
                        history: STARTER_MESSAGES_LIMIT,
                    },
                    files: {
                        total_storage: STARTER_FILE_STORAGE_LIMIT * FileSizes.Gigabyte,
                    },
                    boards: {
                        cards: STARTER_BOARD_CARDS_LIMIT,
                        views: STARTER_BOARDS_VIEW_LIMIT,
                    },
                    integrations: {
                        enabled: STARTER_INTEGRATIONS_LIMIT,
                    },
                },
                needsTheme: true,
            },
        }));
    };
    return (<DisClaimer onClick={openLimitsMiniModal}>
        <i className='icon-alert-outline'/>
        {intl.formatMessage({id: 'pricing_modal.planDisclaimer.starter', defaultMessage: 'This plan has data restrictions.'})}
    </DisClaimer>);
}

export default StarterDisclaimer;
