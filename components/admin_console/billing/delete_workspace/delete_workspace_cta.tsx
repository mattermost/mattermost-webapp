// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {ModalIdentifiers} from 'utils/constants';
import {openModal} from 'actions/views/modals';

import DeleteWorkspaceModal from './delete_workspace_modal';

export default function DeleteWorkspaceCTA() {
    const dispatch = useDispatch();

    const workspaceUrl = window.location.host;

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
                            workspaceLink: <a href={`${workspaceUrl}`}>{workspaceUrl}</a>,
                        }}
                    />
                </div>
                <a
                    rel='noopener noreferrer'
                    target='_blank'
                    className='cancelSubscriptionSection__contactUs'
                    onClick={handleOnClickDelete}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.deleteWorkspaceSection.delete'
                        defaultMessage='Delete Workspace'
                    />
                </a>
            </div>
        </div>
    );
}
