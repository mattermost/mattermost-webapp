// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {FormattedMessage} from 'react-intl';

import {openModal} from 'actions/views/modals';

import {trackEvent} from 'actions/telemetry_actions';
import {ModalIdentifiers} from 'utils/constants';

import PurchaseModal from 'components/purchase_modal';

const UpgradeLink: React.FC = () => {
    const dispatch = useDispatch<DispatchFunc>();

    const onUpgradeMattermostCloud = () => {
        trackEvent('cloud_admin', 'click_upgrade_mattermost_cloud');

        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        }));
    };

    const handleLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        onUpgradeMattermostCloud();
    };

    return (
        <>
            <button
                className='usersEmail__upgradeLink'
                onClick={(e) => handleLinkClick(e)}
            >
                <FormattedMessage
                    id='usersEmail.upgradeLink.warn.upgrade_now'
                    defaultMessage='Upgrade now'
                />
            </button>
        </>
    );
};

export default UpgradeLink;
