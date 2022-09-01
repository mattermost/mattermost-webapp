// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {Route, Switch, useHistory, useParams} from 'react-router-dom';
import iNoBounce from 'inobounce';

import {Team} from '@mattermost/types/teams';

import {isGuest} from 'mattermost-redux/utils/user_utils';

import {startPeriodicStatusUpdates, stopPeriodicStatusUpdates} from 'actions/status_actions';
import {reconnect} from 'actions/websocket_actions.jsx';
import {emitCloseRightHandSide} from 'actions/global_actions';

import Constants from 'utils/constants';
import {isIosSafari} from 'utils/user_agent';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';

import {makeAsyncComponent} from 'components/async_load';
import ChannelController from 'components/channel_layout/channel_controller';
import Pluggable from 'plugins/pluggable';

import LocalStorageStore from 'stores/local_storage_store';

import type {OwnProps, PropsFromRedux} from './index';

const BackstageController = makeAsyncComponent('BackstageController', React.lazy(() => import('components/backstage')));

const WAKEUP_CHECK_INTERVAL = 30000; // 30 seconds
const WAKEUP_THRESHOLD = 60000; // 60 seconds
const UNREAD_CHECK_TIME_MILLISECONDS = 10000;

declare global {
    interface Window {
        isActive: boolean;
    }
}

type Props = PropsFromRedux & OwnProps;

function getTeamFromTeamParam(teamsList: Props['teamsList'], teamParam: Props['match']['params']['team']) {
    if (!teamParam) {
        return null;
    }

    const team = teamsList?.find((teamInList) => teamInList.name === teamParam) ?? null;
    if (!team) {
        return null;
    }

    return team;
}

export default function NeedsTeam(props: Props) {
    const history = useHistory();
    const {team: teamNameParam} = useParams<Props['match']['params']>();

    const [team, setTeam] = useState<Team | null>(getTeamFromTeamParam(props.teamsList, teamNameParam));
    const [isFetchingChannels, setIsFetchingChannels] = useState(true);

    let blurTime = new Date().getTime();
    let lastTime = Date.now();

    function handleFocus() {
        if (props.selectedThreadId) {
            window.isActive = true;
        }
        if (props.currentChannelId) {
            window.isActive = true;
            props.actions.markChannelAsReadOnFocus(props.currentChannelId);
        }
        if (Date.now() - blurTime > UNREAD_CHECK_TIME_MILLISECONDS && props.currentTeamId) {
            props.actions.fetchMyChannelsAndMembers(props.currentTeamId);
        }
    }

    function handleBlur() {
        window.isActive = false;
        blurTime = new Date().getTime();
        if (props.currentUser) {
            props.actions.viewChannel('');
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.shiftKey && cmdOrCtrlPressed(e) && isKeyPressed(e, Constants.KeyCodes.L)) {
            const sidebar = document.getElementById('sidebar-right');
            if (sidebar) {
                if (sidebar.className.match('sidebar--right sidebar--right--expanded move--left')) {
                    const replyTextbox = document.getElementById('reply_textbox');
                    if (replyTextbox) {
                        replyTextbox.focus();
                    }
                } else {
                    const postTextbox = document.getElementById('post_textbox');
                    if (postTextbox) {
                        postTextbox.focus();
                    }
                }
            }
        }
    }

    const wakeUpInterval = window.setInterval(() => {
        const currentTime = (new Date()).getTime();
        if (currentTime > (lastTime + WAKEUP_THRESHOLD)) { // ignore small delays
            console.log('computer woke up - fetching latest'); //eslint-disable-line no-console
            reconnect(false);
        }
        lastTime = currentTime;
    }, WAKEUP_CHECK_INTERVAL);

    useEffect(() => {
        // Set up tracking for whether the window is active
        window.isActive = true;

        props.actions.fetchAllMyTeamsChannelsAndChannelMembers();

        const browserIsIosSafari = isIosSafari();

        if (browserIsIosSafari) {
            // Use iNoBounce to prevent scrolling past the boundaries of the page
            iNoBounce.enable();
        }

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('keydown', handleKeydown);

        startPeriodicStatusUpdates();

        LocalStorageStore.setTeamIdJoinedOnLoad(null);

        return () => {
            window.isActive = false;

            if (browserIsIosSafari) {
                iNoBounce.disable();
            }

            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('keydown', handleKeydown);

            clearInterval(wakeUpInterval);

            stopPeriodicStatusUpdates();
        };
    }, []);

    async function joinTeam(firstLoad = false): Promise<Team |null> {
        // skip reserved teams
        if (Constants.RESERVED_TEAM_NAMES.includes(teamNameParam)) {
            return null;
        }

        try {
            const {data: teamByName} = await props.actions.getTeamByName(teamNameParam);
            if (teamByName && teamByName.delete_at === 0) {
                const {error} = await props.actions.addUserToTeam(teamByName.id, props.currentUser && props.currentUser.id);
                if (error) {
                    return null;
                }

                // User added to the new team, now attempt to initialize the team
                if (firstLoad) {
                    LocalStorageStore.setTeamIdJoinedOnLoad(teamByName.id);
                }
                return teamByName;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async function initTeam(team: Team) {
        // If current team is set, then this is not first load
        // The first load action pulls team unreads
        props.actions.getMyTeamUnreads(props.collapsedThreads);
        props.actions.selectTeam(team);
        props.actions.setPreviousTeamId(team.id);

        if (props.currentUser && isGuest(props.currentUser.roles)) {
            setIsFetchingChannels(true);
        }

        await props.actions.fetchMyChannelsAndMembers(team.id);
        setIsFetchingChannels(false);

        props.actions.loadStatusesForChannelAndSidebar();

        if (props.license &&
            props.license.IsLicensed === 'true' &&
            (props.license.LDAPGroups === 'true' || props.isCustomGroupsEnabled)) {
            if (props.currentUser) {
                props.actions.getGroupsByUserIdPaginated(props.currentUser.id, false, 0, 60, true);
            }

            if (props.license.LDAPGroups === 'true') {
                props.actions.getAllGroupsAssociatedToChannelsInTeam(team.id, true);
            }

            if (team.group_constrained && props.license.LDAPGroups === 'true') {
                props.actions.getAllGroupsAssociatedToTeam(team.id, true);
            } else {
                props.actions.getGroups(false, 0, 60);
            }
        }
    }

    async function joinTeamAndInit() {
        try {
            const joinedTeam = await joinTeam();

            if (joinedTeam) {
                initTeam(joinedTeam);
                setTeam(joinedTeam);
            } else {
                throw new Error('Unable to join team');
            }
        } catch (error) {
            history.push('/error?type=team_not_found');
        }
    }

    // Effect to run when url for team changes
    useEffect(() => {
        const team = getTeamFromTeamParam(props.teamsList, teamNameParam);

        if (team) {
            // User belongs to team found in url
            initTeam(team);
            setTeam(team);

            // Prevents the RHS from closing when clicking on a global permalink.
            emitCloseRightHandSide();
        } else {
            // User is not a member of the team found in the url
            // attempt to join the team
            joinTeamAndInit();
        }
    }, [teamNameParam]);

    if (props.mfaRequired) {
        history.push('/mfa/setup');
        return null;
    }

    if (team === null) {
        return null;
    }

    return (
        <Switch>
            <Route
                path={'/:team/integrations'}
                component={BackstageController}
            />
            <Route
                path={'/:team/emoji'}
                component={BackstageController}
            />
            {props.plugins?.map((plugin: any) => (
                <Route
                    key={plugin.id}
                    path={'/:team/' + plugin.route}
                    render={() => (
                        <Pluggable
                            pluggableName={'NeedsTeamComponent'}
                            pluggableId={plugin.id}
                        />
                    )}
                />
            ))}
            <ChannelController
                shouldShowAppBar={props.shouldShowAppBar}
                isFetchingChannels={isFetchingChannels}
            />
        </Switch>
    );
}
