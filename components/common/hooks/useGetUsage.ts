// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {CloudUsage} from '@mattermost/types/cloud';

import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getUsage} from 'mattermost-redux/selectors/entities/cloud';
import {
    getMessagesUsage,
    getFilesUsage,
    getIntegrationsUsage,
    getBoardsUsage,
} from 'actions/cloud';

export default function useGetUsage(): CloudUsage {
    const usage = useSelector(getUsage)

    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const dispatch = useDispatch();

    const [requestedMessages, setRequestedMessages] = useState(false);
    useEffect(() => {
        if (isCloudFreeEnabled && !requestedMessages && !usage.messages.historyLoaded) {
            dispatch(getMessagesUsage());
            setRequestedMessages(true);
        }
    }, [isCloudFreeEnabled, requestedMessages, usage.messages.historyLoaded]);

    const [requestedStorage, setRequestedStorage] = useState(false);
    useEffect(() => {
        if (isCloudFreeEnabled && !requestedStorage && !usage.files.totalStorage) {
            dispatch(getFilesUsage());
            setRequestedStorage(true);
        }
    }, [isCloudFreeEnabled, requestedStorage, usage.files.totalStorageLoaded]);

    const [requestedIntegrations, setRequestedIntegrations] = useState(false);
    useEffect(() => {
        if (isCloudFreeEnabled && !requestedIntegrations && !usage.integrations.enabledLoaded) {
            dispatch(getIntegrationsUsage());
            setRequestedIntegrations(true);
        }
    }, [isCloudFreeEnabled, requestedIntegrations, usage.integrations.enabledLoaded]);

    const [requestedBoardsUsage, setRequestedBoardsUsage] = useState(false);
    useEffect(() => {
        if (isCloudFreeEnabled && !requestedBoardsUsage && !usage.integrations.enabledLoaded) {
            dispatch(getBoardsUsage());
            setRequestedBoardsUsage(true);
        }
    }, [isCloudFreeEnabled, requestedBoardsUsage, usage.integrations.enabledLoaded]);

    return usage;
}
