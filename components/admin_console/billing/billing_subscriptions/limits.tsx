// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudLimits, getCloudLimitsLoaded} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';
import {getInstalledIntegrations as fetchInstalledIntegrations} from 'mattermost-redux/actions/integrations';
import {getEnabledIntegrations} from 'mattermost-redux/selectors/entities/integrations';

import {FileSizes} from 'utils/file_utils';
import {asGBString} from 'utils/limits';

import LimitCard from './limit_card';

// TODO: Replace this with actual usages stored in redux,
// that ideally are updated with a websocket event in near real time.
const fakeUsage = {
    files: {
        totalStorage: Number(FileSizes.Gigabyte) * 2,
    },
    messages: {
        history: 11000,
    },
    boards: {
        cards: 300,
    },
    integrations: {
        enabled: 9,
    },
};

const Limits = (): JSX.Element | null => {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const cloudLimits = useSelector(getCloudLimits);
    const cloudLimitsReceived = useSelector(getCloudLimitsLoaded);
    const enabledIntegrations = useSelector(getEnabledIntegrations);
    const dispatch = useDispatch();
    const intl = useIntl();
    const [requestedLimits, setRequestedLimits] = useState(false);

    useEffect(() => {
        dispatch(fetchInstalledIntegrations());
    }, []);

    useEffect(() => {
        if (isCloudFreeEnabled && !requestedLimits) {
            dispatch(getCloudLimitsAction());
            setRequestedLimits(true);
        }
    }, [isCloudFreeEnabled, requestedLimits]);

    if (!isCloudFreeEnabled || !cloudLimitsReceived) {
        return null;
    }

    return (
        <div className='ProductLimitsPanel'>
            <div className='ProductLimitsPanel__title'>
                <FormattedMessage
                    id='workspace_limits.upgrade'
                    defaultMessage='Upgrade to avoid {planName} data limits'
                    values={{
                        planName: 'Cloud Starter',
                    }}
                />
            </div>
            <div className='ProductLimitsPanel__limits'>
                {cloudLimits?.files?.total_storage && (
                    <LimitCard
                        name={(
                            <FormattedMessage
                                id='workspace_limits.file_storage'
                                defaultMessage='File Storage'
                            />
                        )}
                        status={(
                            <FormattedMessage
                                id='workspace_limits.file_storage.usage'
                                defaultMessage='{actual} of {limit} ({percent}%)'
                                values={{
                                    actual: asGBString(fakeUsage.files.totalStorage, intl.formatNumber),
                                    limit: asGBString(cloudLimits.files.total_storage, intl.formatNumber),
                                    percent: Math.floor((fakeUsage.files.totalStorage / cloudLimits.files.total_storage) * 100),

                                }}
                            />
                        )}
                        percent={Math.floor((fakeUsage.files.totalStorage / cloudLimits.files.total_storage) * 100)}
                        icon='icon-folder-outline'
                    />
                )}
                {cloudLimits?.messages?.history && (
                    <LimitCard
                        name={
                            <FormattedMessage
                                id='workspace_limits.message_history'
                                defaultMessage='Message History'
                            />
                        }
                        status={
                            <FormattedMessage
                                id='workspace_limits.message_history.usage'
                                defaultMessage='{actual} of {limit} ({percent}%)'
                                values={{
                                    actual: `${Math.floor(fakeUsage.messages.history / 1000)}K`,
                                    limit: `${Math.floor(cloudLimits.messages.history / 1000)}K`,
                                    percent: Math.floor((fakeUsage.messages.history / cloudLimits.messages.history) * 100),
                                }}
                            />
                        }
                        percent={Math.floor((fakeUsage.messages.history / cloudLimits.messages.history) * 100)}
                        icon='icon-message-text-outline'
                    />
                )}
                {cloudLimits?.boards?.cards && (
                    <LimitCard
                        name={(
                            <FormattedMessage
                                id='workspace_limits.boards_cards'
                                defaultMessage='Board Cards per Server'
                            />
                        )}
                        status={(
                            <FormattedMessage
                                id='workspace_limits.boards_cards.usage'
                                defaultMessage='{actual} of {limit} cards ({percent}%)'
                                values={{
                                    actual: fakeUsage.boards.cards,
                                    limit: cloudLimits.boards.cards,
                                    percent: Math.floor((fakeUsage.boards.cards / cloudLimits.boards.cards) * 100),
                                }}
                            />
                        )}
                        percent={Math.floor((fakeUsage.boards.cards / cloudLimits.boards.cards) * 100)}
                        icon='icon-product-boards'
                    />

                )}
                {cloudLimits?.integrations?.enabled && (
                    <LimitCard
                        name={
                            <FormattedMessage
                                id='workspace_limits.integrations_enabled'
                                defaultMessage='Enabled Integrations'
                            />
                        }
                        status={(
                            <FormattedMessage
                                id='workspace_limits.integrations_enabled.usage'
                                defaultMessage='{actual} of {limit} integrations ({percent}%)'
                                values={{
                                    actual: enabledIntegrations.length,
                                    limit: cloudLimits.integrations.enabled,
                                    percent: Math.floor((enabledIntegrations.length / cloudLimits.integrations.enabled) * 100),
                                }}
                            />
                        )}
                        percent={Math.floor((enabledIntegrations.length / cloudLimits.integrations.enabled) * 100)}
                        icon='icon-product-boards'
                    />

                )}
            </div>
        </div>
    );
};

export default Limits;
