// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';
import classNames from 'classnames';
import {DragDropContext, Droppable, DroppableProvided, DropResult} from 'react-beautiful-dnd';
import {Team} from 'mattermost-redux/types/teams';
import {Dictionary} from 'mattermost-redux/src/types/utilities';
import {TeamMembership} from 'mattermost-redux/src/types/teams';
import {Dispatch} from 'redux';
import {GenericAction, GetStateFunc} from 'mattermost-redux/types/actions';

import {Constants} from 'utils/constants.jsx';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import Pluggable from 'plugins/pluggable';

import TeamButton from './components/team_button';

type Actions = {
    getTeams: (page?: number, perPage?: number, includeTotalCount?: boolean) => void;
    switchTeam: (url: string) => (dispatch: Dispatch<GenericAction>, getState: GetStateFunc) => void;
    updateTeamsOrderForUser: (teamIds: string[]) => (dispatch: Dispatch<GenericAction>, getState: GetStateFunc) => Promise<void>;
}

type State = {
    showOrder: boolean;
    teamsOrder: Array<Team>;
}

interface Props {
    myTeams: Team[];
    currentTeamId: string;
    match: { url: string };
    moreTeamsToJoin: boolean;
    myTeamMembers: Dictionary<TeamMembership>;
    isOpen: boolean;
    experimentalPrimaryTeam?: string ;
    locale: string;
    actions: Actions;
    userTeamsOrderPreference: string;
}

export function renderView(props: Props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props: Props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props: Props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

export default class LegacyTeamSidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showOrder: false,
            teamsOrder: [],
        };
    }

    switchToPrevOrNextTeam = (e: KeyboardEvent, currentTeamId: string, teams: Array<Team>) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            e.preventDefault();
            const delta = Utils.isKeyPressed(e, Constants.KeyCodes.DOWN) ? 1 : -1;
            const pos = teams.findIndex((team: Team) => team.id === currentTeamId);
            const newPos = pos + delta;

            let team;
            if (newPos === -1) {
                team = teams[teams.length - 1];
            } else if (newPos === teams.length) {
                team = teams[0];
            } else {
                team = teams[newPos];
            }

            this.props.actions.switchTeam(`/${team.name}`);
            return true;
        }
        return false;
    }

    switchToTeamByNumber = (e: KeyboardEvent, currentTeamId: string, teams: Array<Team>) => {
        const digits = [
            Constants.KeyCodes.ONE,
            Constants.KeyCodes.TWO,
            Constants.KeyCodes.THREE,
            Constants.KeyCodes.FOUR,
            Constants.KeyCodes.FIVE,
            Constants.KeyCodes.SIX,
            Constants.KeyCodes.SEVEN,
            Constants.KeyCodes.EIGHT,
            Constants.KeyCodes.NINE,
            Constants.KeyCodes.ZERO,
        ];

        for (const idx in digits) {
            if (Utils.isKeyPressed(e, digits[idx]) && parseInt(idx, 10) < teams.length) {
                e.preventDefault();

                // prevents reloading the current team, while still capturing the keyboard shortcut
                if (teams[idx].id === currentTeamId) {
                    return false;
                }
                const team = teams[idx];
                this.props.actions.switchTeam(`/${team.name}`);
                return true;
            }
        }
        return false;
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.altKey) {
            const {currentTeamId} = this.props;
            const teams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale, this.props.userTeamsOrderPreference);

            if (this.switchToPrevOrNextTeam(e, currentTeamId, teams)) {
                return;
            }

            if (this.switchToTeamByNumber(e, currentTeamId, teams)) {
                return;
            }

            this.setState({showOrder: true});
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        if (!((e.ctrlKey || e.metaKey) && e.altKey)) {
            this.setState({showOrder: false});
        }
    }

    componentDidMount() {
        this.props.actions.getTeams(0, 200);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    onDragEnd = (result: DropResult) => {
        const {
            updateTeamsOrderForUser,
        } = this.props.actions;

        if (!result.destination) {
            return;
        }

        const teams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale, this.props.userTeamsOrderPreference);

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        // Positioning the dropped Team button
        const popElement = (list: Team[], idx: number) => {
            return [...list.slice(0, idx), ...list.slice(idx + 1, list.length)];
        };

        const pushElement = (list: Team[], idx: number, itemId: string): Team[] => {
            return [
                ...list.slice(0, idx),
                teams.find((team) => team.id === itemId),
                ...list.slice(idx, list.length),
            ];
        };

        const newTeamsOrder = pushElement(
            popElement(teams, sourceIndex),
            destinationIndex,
            result.draggableId,
        );
        updateTeamsOrderForUser(newTeamsOrder.map((o: Team) => o.id));
        this.setState({teamsOrder: newTeamsOrder});
    }

    render() {
        const root: Element | null = document.querySelector('#root');
        if (this.props.myTeams.length <= 1) {
            root!.classList.remove('multi-teams');
            return null;
        }
        root!.classList.add('multi-teams');

        const plugins = [];
        const sortedTeams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale, this.props.userTeamsOrderPreference);

        const teams = sortedTeams.map((team: Team, index: number) => {
            const member = this.props.myTeamMembers[team.id];
            return (
                <TeamButton
                    key={'switch_team_' + team.name}
                    url={`/${team.name}`}
                    tip={team.display_name}
                    active={team.id === this.props.currentTeamId}
                    displayName={team.display_name}
                    unread={member.msg_count > 0}
                    order={index + 1}
                    showOrder={this.state.showOrder}
                    mentions={member.mention_count}
                    teamIconUrl={Utils.imageURLForTeam(team)}
                    switchTeam={this.props.actions.switchTeam}
                    isDraggable={true}
                    teamId={team.id}
                    teamIndex={index}
                />
            );
        });

        const joinableTeams = [];

        if (this.props.moreTeamsToJoin && !this.props.experimentalPrimaryTeam) {
            joinableTeams.push(
                <TeamButton
                    btnClass='team-btn__add'
                    key='more_teams'
                    url='/select_team'
                    tip={
                        <FormattedMessage
                            id='team_sidebar.join'
                            defaultMessage='Other teams you can join'
                        />
                    }
                    content={'+'}
                    switchTeam={this.props.actions.switchTeam}
                />,
            );
        } else {
            joinableTeams.push(
                <SystemPermissionGate
                    permissions={[Permissions.CREATE_TEAM]}
                    key='more_teams'
                >
                    <TeamButton
                        btnClass='team-btn__add'
                        url='/create_team'
                        tip={
                            <FormattedMessage
                                id='navbar_dropdown.create'
                                defaultMessage='Create a Team'
                            />
                        }
                        content={'+'}
                        switchTeam={this.props.actions.switchTeam}
                    />
                </SystemPermissionGate>,
            );
        }

        plugins.push(
            <div
                key='team-sidebar-bottom-plugin'
                className='team-sidebar-bottom-plugin is-empty'
            >
                <Pluggable pluggableName='BottomTeamSidebar'/>
            </div>,
        );

        return (
            <div
                className={classNames('team-sidebar', {'move--right': this.props.isOpen})}
                role='navigation'
                aria-labelledby='teamSidebarWrapper'
            >
                <div
                    className='team-wrapper'
                    id='teamSidebarWrapper'
                >
                    <Scrollbars
                        autoHide={true}
                        autoHideTimeout={500}
                        autoHideDuration={500}
                        renderThumbHorizontal={renderThumbHorizontal}
                        renderThumbVertical={renderThumbVertical}
                        renderView={renderView}
                    >
                        <DragDropContext
                            onDragEnd={this.onDragEnd}
                        >
                            <Droppable
                                droppableId='my_teams'
                                type='TEAM_BUTTON'
                            >
                                {(provided: DroppableProvided) => {
                                    return (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {teams}
                                            {provided.placeholder}
                                        </div>
                                    );
                                }}
                            </Droppable>
                        </DragDropContext>
                        {joinableTeams}
                    </Scrollbars>
                </div>
                {plugins}
            </div>
        );
    }
}
