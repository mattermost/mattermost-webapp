// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {ActionTypes, CloudProducts} from 'utils/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudProducts, getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {getCloudSubscription as selectCloudSubscription, getSubscriptionProduct as selectSubscriptionProduct, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {Post} from '@mattermost/types/posts';

function CustomOpenPricingModalComponent(props: {post: Post}) {
    openPricingModal = useOpenPricingModal();
    const style = {
        padding: '12px',
        borderRadius: '0 4px 4px 0',
        border: '1px solid rgba(var(--center-channel-text-rgb), 0.16)',
        borderLeft: '5px solid var(--denim-sidebar-active-border)',
        width: 'max-content',
        margin: '10px 0',
    };

    const btnStyle = {
        background: 'var(--button-bg)',
        color: 'var(--button-color)',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 20px',
        fontWeight: 600,
    };

    return (
        <div>
            <span>{props.post.message}</span>
            <div
                style={style}
            >
                <button
                    onClick={openPricingModal}
                    style={btnStyle}
                >
                    {'View upgrade options'}
                </button>
            </div>
        </div>
    );
}

const UpgradeButton = styled.button`
background: var(--denim-button-bg);
border-radius: 4px;
border: none;
box-shadow: none;
height: 24px;
width: 67px;
font-family: 'Open Sans';
font-style: normal;
font-weight: 600;
font-size: 11px !important;
line-height: 10px;
letter-spacing: 0.02em;
color: var(--button-color);
`;

let openPricingModal: () => void;

const UpgradeCloudButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const subscription = useSelector(selectCloudSubscription);
    const product = useSelector(selectSubscriptionProduct);
    const isCloud = useSelector(isCurrentLicenseCloud);

    useEffect(() => {
        if (isCloud) {
            dispatch(getCloudSubscription());
            dispatch(getCloudProducts());
        }

        // piggyback on plugins state to register a custom post renderer
        const postTypeId = 'upgrade_post_message';
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_POST_COMPONENT,
            data: {
                postTypeId,
                pluginId: postTypeId,
                type: 'custom_up_notification',
                component: CustomOpenPricingModalComponent,
            },
        });
    }, [isCloud]);

    openPricingModal = useOpenPricingModal();

    const isEnterpriseTrial = subscription?.is_free_trial === 'true';
    const isStarter = product?.sku === CloudProducts.STARTER;

    if (!isCloud || !isAdmin || !isCloudFreeEnabled) {
        return null;
    }

    let btn = null;
    if (isStarter || isEnterpriseTrial) {
        btn = (
            <UpgradeButton
                id='UpgradeButton'
                onClick={openPricingModal}
            >
                {formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'})}
            </UpgradeButton>);
    }

    return btn;
};

export default UpgradeCloudButton;
export {openPricingModal};
