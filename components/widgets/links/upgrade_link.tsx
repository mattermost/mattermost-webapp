// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {FormattedMessage} from 'react-intl';

import {openModal} from 'actions/views/modals';
import {trackEvent} from 'actions/telemetry_actions';
import {ModalIdentifiers} from 'utils/constants';
import PurchaseModal from 'components/purchase_modal';

export interface UpgradeLinkProps {
    telemetryInfo?: string;
    extraClass?: string;
    buttonText?: ReactNode;
}

const UpgradeLink: React.FC<UpgradeLinkProps> = (props: UpgradeLinkProps) => {
    const dispatch = useDispatch<DispatchFunc>();
    const defaultText = (
        <FormattedMessage
            id='upgradeLink.warn.upgrade_now'
            defaultMessage='Upgrade now'
        />
    );

    const handleLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (props.telemetryInfo) {
            trackEvent('upgrade_mm_cloud', props.telemetryInfo);
        }
        try {
            dispatch(openModal({
                modalId: ModalIdentifiers.CLOUD_PURCHASE,
                dialogType: PurchaseModal,
            }));
        } catch (error) {
            // do nothing
        }
    };
    return (
        <button
            className={`upgradeLink ${props.extraClass ? props.extraClass : ''}`}
            onClick={(e) => handleLinkClick(e)}
        >
            {props.buttonText ? props.buttonText : defaultText}
        </button>
    );
};

export default UpgradeLink;
