// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';

const Limits = (): JSX.Element | null => {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const cloudLimits = useSelector(getCloudLimits);
    const dispatch = useDispatch();
    const [requestedLimits, setRequestedLimits] = useState(false);

    useEffect(() => {
        if (isCloudFreeEnabled && !requestedLimits) {
            dispatch(getCloudLimitsAction());
            setRequestedLimits(true);
        }
    }, [isCloudFreeEnabled, requestedLimits]);

    if (!isCloudFreeEnabled || !(cloudLimits?.messages?.history)) {
        return null;
    }

    return (
        <div>
            <div>
                <FormattedMessage
                    id='workspace_limits.upgrade'
                    defaultMessage='Upgrade to avoid {planName} data limits'
                    values={{
                        planName: 'Cloud Starter',
                    }}
                />
            </div>
            {cloudLimits.files && (
                <div>
                    <FormattedMessage
                        id='workspace_limits.file_storage'
                        defaultMessage='File Storage'
                    />
                    <FormattedMessage
                        id='workspace_limits.file_storage.usage'
                        defaultMessage='{actual} of {limit} ({percent}%)'
                        values={{
                            actual: '1GB',
                            limit: `${Math.floor(cloudLimits.files.total_storage / (1 * 8 * 1024 * 1024 * 1024))}GB`,
                            percent: Math.floor((1 / (cloudLimits.files.total_storage / (1 * 8 * 1024 * 1024 * 1024))) * 100),
                        }}
                    />
                </div>

            )}
            {cloudLimits.messages && (
                <div>
                    <FormattedMessage
                        id='workspace_limits.message_history'
                        defaultMessage='File Storage'
                    />
                    <FormattedMessage
                        id='workspace_limits.message_history.usage'
                        defaultMessage='{actual} of {limit} ({percent}%)'
                        values={{
                            actual: `${Math.floor(2000 / 1000)}K`,
                            limit: `${Math.floor(cloudLimits.messages.history / 1000)}K`,
                            percent: Math.floor((2000 / cloudLimits.messages.history) * 100),
                        }}
                    />
                </div>

            )}
            {cloudLimits.boards && (
                <div>
                    <FormattedMessage
                        id='workspace_limits.boards_cards'
                        defaultMessage='Board Cards per Server'
                    />
                    <FormattedMessage
                        id='workspace_limits.boards_cards.usage'
                        defaultMessage='{actual} of {limit} cards ({percent}%)'
                        values={{
                            actual: 200,
                            limit: cloudLimits.boards.cards,
                            percent: Math.floor((200 / cloudLimits.boards.cards) * 100),
                        }}
                    />
                </div>

            )}
            {cloudLimits.integrations && (
                <div>
                    <FormattedMessage
                        id='workspace_limits.integrations_enabled'
                        defaultMessage='Enabled Integrations'
                    />
                    <FormattedMessage
                        id='workspace_limits.integrations_enabled.usage'
                        defaultMessage='{actual} of {limit} integrations ({percent}%)'
                        values={{
                            actual: 4,
                            limit: cloudLimits.integrations.enabled,
                            percent: Math.floor((4 / cloudLimits.integrations.enabled) * 100),
                        }}
                    />
                </div>

            )}
        </div>
    );
};

export default Limits;

