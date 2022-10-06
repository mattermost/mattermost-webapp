// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {lazy, memo, useEffect, useRef, useState} from 'react';
import {Route, Switch, useHistory, useParams} from 'react-router-dom';
import iNoBounce from 'inobounce';

import {Team} from '@mattermost/types/teams';
import {ServerError} from '@mattermost/types/errors';

import {ActionResult} from 'mattermost-redux/types/actions';

import {reconnect} from 'actions/websocket_actions.jsx';
import {emitCloseRightHandSide} from 'actions/global_actions';

import Constants from 'utils/constants';
import {isIosSafari} from 'utils/user_agent';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';

import {makeAsyncComponent} from 'components/async_load';
import ChannelController from 'components/channel_layout/channel_controller';

import LocalStorageStore from 'stores/local_storage_store';

import type {OwnProps, PropsFromRedux} from './index';

const BackstageController = makeAsyncComponent('BackstageController', lazy(() => import('components/backstage')));
const Pluggable = makeAsyncComponent('Pluggable', lazy(() => import('plugins/pluggable')));

const WAKEUP_CHECK_INTERVAL = 30000; // 30 seconds
const WAKEUP_THRESHOLD = 60000; // 60 seconds
const UNREAD_CHECK_TIME_MILLISECONDS = 10000;

declare global {
    interface Window {
        isActive: boolean;
    }
}

type Props = PropsFromRedux & OwnProps;

function TeamController(props: Props) {
    const history = useHistory();
    const {team: teamNameParam} = useParams<Props['match']['params']>();

    const [team, setTeam] = useState<Team | null>(getTeamFromTeamList(props.teamsList, teamNameParam));

    const blurTime = useRef(new Date().getTime());
    const lastTime = useRef(Date.now());

    function handleFocus() {
        if (props.selectedThreadId) {
            window.isActive = true;
        }
        if (props.currentChannelId) {
            window.isActive = true;
            props.markChannelAsReadOnFocus(props.currentChannelId);
        }

        const currentTime = (new Date()).getTime();
        if ((currentTime - blurTime.current) > UNREAD_CHECK_TIME_MILLISECONDS && props.currentTeamId) {
            if (props.graphQLEnabled) {
                props.fetchChannelsAndMembers(props.currentTeamId);
            } else {
                props.fetchMyChannelsAndMembersREST(props.currentTeamId);
            }
        }
    }

    function handleBlur() {
        window.isActive = false;
        blurTime.current = new Date().getTime();

        if (props.currentUser) {
            props.viewChannel('');
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

    useEffect(() => {
        if (props.graphQLEnabled) {
            props.fetchChannelsAndMembers();
        } else {
            props.fetchAllMyTeamsChannelsAndChannelMembersREST();
        }
    }, []);

    useEffect(() => {
        const wakeUpIntervalId = setInterval(() => {
            const currentTime = (new Date()).getTime();
            if ((currentTime - lastTime.current) > WAKEUP_THRESHOLD) {
                console.log('computer woke up - fetching latest'); //eslint-disable-line no-console
                reconnect(false);
            }
            lastTime.current = currentTime;
        }, WAKEUP_CHECK_INTERVAL);

        return () => {
            clearInterval(wakeUpIntervalId);
        };
    }, []);

    // Effect runs on mount, add event listeners on windows object
    useEffect(() => {
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    // Effect runs on mount, adds active state to window
    useEffect(() => {
        const browserIsIosSafari = isIosSafari();
        if (browserIsIosSafari) {
            // Use iNoBounce to prevent scrolling past the boundaries of the page
            iNoBounce.enable();
        }

        // Set up tracking for whether the window is active
        window.isActive = true;

        LocalStorageStore.setTeamIdJoinedOnLoad(null);

        return () => {
            window.isActive = false;

            if (browserIsIosSafari) {
                iNoBounce.disable();
            }
        };
    }, []);

    async function initTeamOrRedirect(team: Team) {
        try {
            await props.initializeTeam(team);
            setTeam(team);
        } catch (error) {
            history.push('/error?type=team_not_found');
        }
    }

    async function joinTeamOrRedirect(teamNameParam: string, joinedOnFirstLoad: boolean) {
        try {
            // skip reserved team names
            if (Constants.RESERVED_TEAM_NAMES.includes(teamNameParam)) {
                throw new Error('Team name is reserved');
            }

            const {data: joinedTeam} = await props.joinTeam(teamNameParam, joinedOnFirstLoad) as ActionResult<Team, ServerError>; // Fix in MM-46907;
            if (joinedTeam) {
                setTeam(joinedTeam);
            } else {
                throw new Error('Unable to join team');
            }
        } catch (error) {
            history.push('/error?type=team_not_found');
        }
    }

    const teamsListDependency = props.teamsList.map((team) => team.id).sort().join('+');

    // Effect to run when url for team or teamsList changes
    useEffect(() => {
        // Prevents the RHS from closing when clicking on a global permalink.
        emitCloseRightHandSide();

        const teamFromURLParam = getTeamFromTeamList(props.teamsList, teamNameParam);
        if (teamFromURLParam) {
            // Team switch
            initTeamOrRedirect(teamFromURLParam);
            return;
        }

        if (teamNameParam && !team) {
            // Team join on first load
            joinTeamOrRedirect(teamNameParam, true);
            return;
        }

        if (teamNameParam && team && team.name !== teamNameParam) {
            // Team join by going through a link
            joinTeamOrRedirect(teamNameParam, false);
        }
    }, [teamNameParam, teamsListDependency]);

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
            {props.plugins?.map((plugin) => (
                <Route
                    key={plugin.id}
                    path={'/:team/' + (plugin as any).route}
                    render={() => (
                        <Pluggable
                            pluggableName={'NeedsTeamComponent'}
                            pluggableId={plugin.id}
                        />
                    )}
                />
            ))}
            <ChannelController/>
        </Switch>
    );
}

function getTeamFromTeamList(teamsList: Props['teamsList'], teamName?: string) {
    if (!teamName) {
        return null;
    }

    const team = teamsList.find((teamInList) => teamInList.name === teamName) ?? null;
    if (!team) {
        return null;
    }

    return team;
}

export default memo(TeamController);
