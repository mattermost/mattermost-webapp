// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {CloudProducts, ModalIdentifiers} from 'utils/constants';
import {openModal} from 'actions/views/modals';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCloudLicense} from 'utils/license_utils';

import {getCloudSubscription, getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

import ExternalLink from 'components/external_link';

import DeleteWorkspaceModal from './delete_workspace_modal';

export default function DeleteWorkspaceCTA() {
    const dispatch = useDispatch();

    const workspaceUrl = window.location.host;

    const license = useSelector(getLicense);
    const subscription = useSelector(getCloudSubscription);
    const product = useSelector(getSubscriptionProduct);

    const isNotCloud = !isCloudLicense(license);
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const isEnterprise = product?.sku === CloudProducts.ENTERPRISE;

    const handleOnClickDelete = () => {
        trackEvent('cloud_admin', 'click_delete_workspace');

        dispatch(
            openModal({
                modalId: ModalIdentifiers.DELETE_WORKSPACE,
                dialogType: DeleteWorkspaceModal,
                dialogProps: {
                    callerCTA: 'system_console > billing > subscription > delete_workspace_cta',
                },
            }),
        );
    };

    // Can only delete or downgrade via workspace deletion modal if:
    // - the user has a cloud product
    // - the user is on a free trial (enterprise product with trial status)
    // - the user is on a starter subscription
    // - the user is on a monthly professional subscription
    //
    // For clarity, workspaces with the following subscriptions may be deleted:
    // - Cloud-Starter
    // - Cloud-Professional (monthly)
    // - Enterprise Free Trial
    if (isNotCloud || (isEnterprise && !isFreeTrial)) {
        return null;
    }

    return (
        <div className='cancelSubscriptionSection'>
            <div className='cancelSubscriptionSection__text'>
                <div className='cancelSubscriptionSection__text-title'>
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceSection.title'
                        defaultMessage='Delete your workspace'
                    />
                </div>
                <div className='cancelSubscriptionSection__text-description'>
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceSection.description'
                        defaultMessage='Deleting {workspaceLink} is final and cannot be reversed.'
                        values={{
                            workspaceLink: (
                                <a href={`${workspaceUrl}`}>{workspaceUrl}</a>
                            ),
                        }}
                    />
                </div>
                <ExternalLink
                    href=''
                    location='delete_workspace_cta'
                    className='cancelSubscriptionSection__contactUs'
                    onClick={handleOnClickDelete}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceSection.delete'
                        defaultMessage='Delete Workspace'
                    />
                </ExternalLink>
            </div>
        </div>
    );
}
