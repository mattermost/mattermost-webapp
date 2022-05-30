// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CloudUsage} from '@mattermost/types/cloud';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getUsage} from 'mattermost-redux/selectors/entities/usage';
import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {
    getMessagesUsage,
    getFilesUsage,
    getIntegrationsUsage,
    getBoardsUsage,
    getTeamsUsage,
} from 'actions/cloud';

export default function useGetUsage(): CloudUsage {
    const usage = useSelector(getUsage);
    const isCloud = useSelector(isCurrentLicenseCloud);

    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const dispatch = useDispatch();

    const [requestedMessages, setRequestedMessages] = useState(false);
    useEffect(() => {
        if (isCloud && isCloudFreeEnabled && !requestedMessages && !usage.messages.historyLoaded) {
            dispatch(getMessagesUsage());
            setRequestedMessages(true);
        }
    }, [isCloudFreeEnabled, requestedMessages, usage.messages.historyLoaded]);

    const [requestedStorage, setRequestedStorage] = useState(false);
    useEffect(() => {
        if (isCloud && isCloudFreeEnabled && !requestedStorage && !usage.files.totalStorageLoaded) {
            dispatch(getFilesUsage());
            setRequestedStorage(true);
        }
    }, [isCloudFreeEnabled, requestedStorage, usage.files.totalStorageLoaded]);

    const [requestedIntegrations, setRequestedIntegrations] = useState(false);
    useEffect(() => {
        if (isCloud && isCloudFreeEnabled && !requestedIntegrations && !usage.integrations.enabledLoaded) {
            dispatch(getIntegrationsUsage());
            setRequestedIntegrations(true);
        }
    }, [isCloudFreeEnabled, requestedIntegrations, usage.integrations.enabledLoaded]);

    const [requestedBoardsUsage, setRequestedBoardsUsage] = useState(false);
    useEffect(() => {
        if (isCloud && isCloudFreeEnabled && !requestedBoardsUsage && !usage.boards.cardsLoaded) {
            dispatch(getBoardsUsage());
            setRequestedBoardsUsage(true);
        }
    }, [isCloudFreeEnabled, requestedBoardsUsage, usage.boards.cardsLoaded, isCloud]);

    const [requestedTeamsUsage, setRequestedTeamsUsage] = useState(false);
    useEffect(() => {
        if (isCloudFreeEnabled && !requestedTeamsUsage && !usage.teams.teamsLoaded) {
            dispatch(getTeamsUsage());
            setRequestedTeamsUsage(true);
        }
    }, [isCloudFreeEnabled, requestedTeamsUsage, usage.teams.teamsLoaded]);

    return usage;
}
