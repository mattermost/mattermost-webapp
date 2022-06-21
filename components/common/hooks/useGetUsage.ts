// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CloudUsage} from '@mattermost/types/cloud';
import {getUsage} from 'mattermost-redux/selectors/entities/usage';
import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {
    getMessagesUsage,
    getFilesUsage,
    getIntegrationsUsage,
    getBoardsUsage,
    getTeamsUsage,
} from 'actions/cloud';
import {useIsLoggedIn} from 'components/global_header/hooks';

export default function useGetUsage(): CloudUsage {
    const usage = useSelector(getUsage);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const isLoggedIn = useIsLoggedIn();

    const dispatch = useDispatch();

    const [requestedMessages, setRequestedMessages] = useState(false);
    useEffect(() => {
        if (isLoggedIn && isCloud && !requestedMessages && !usage.messages.historyLoaded) {
            dispatch(getMessagesUsage());
            setRequestedMessages(true);
        }
    }, [isLoggedIn, isCloud, requestedMessages, usage.messages.historyLoaded]);

    const [requestedStorage, setRequestedStorage] = useState(false);
    useEffect(() => {
        if (isLoggedIn && isCloud && !requestedStorage && !usage.files.totalStorageLoaded) {
            dispatch(getFilesUsage());
            setRequestedStorage(true);
        }
    }, [isLoggedIn, isCloud, requestedStorage, usage.files.totalStorageLoaded]);

    const [requestedIntegrations, setRequestedIntegrations] = useState(false);
    useEffect(() => {
        if (isLoggedIn && isCloud && !requestedIntegrations && !usage.integrations.enabledLoaded) {
            dispatch(getIntegrationsUsage());
            setRequestedIntegrations(true);
        }
    }, [isLoggedIn, isCloud, requestedIntegrations, usage.integrations.enabledLoaded]);

    const [requestedBoardsUsage, setRequestedBoardsUsage] = useState(false);
    useEffect(() => {
        if (isLoggedIn && isCloud && !requestedBoardsUsage && !usage.boards.cardsLoaded) {
            dispatch(getBoardsUsage());
            setRequestedBoardsUsage(true);
        }
    }, [isLoggedIn, isCloud, requestedBoardsUsage, usage.boards.cardsLoaded, isCloud]);

    const [requestedTeamsUsage, setRequestedTeamsUsage] = useState(false);
    useEffect(() => {
        if (isLoggedIn && isCloud && !requestedTeamsUsage && !usage.teams.teamsLoaded) {
            dispatch(getTeamsUsage());
            setRequestedTeamsUsage(true);
        }
    }, [isLoggedIn, isCloud, requestedTeamsUsage, usage.teams.teamsLoaded]);

    return usage;
}
