// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';
import classNames from 'classnames';

import {Constants} from 'utils/constants.jsx';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import Pluggable from 'plugins/pluggable';

import TeamButton from './components/team_button.jsx';

export function renderView(props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

export default class TeamSidebar extends React.PureComponent {
    static propTypes = {
        myTeams: PropTypes.array.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        moreTeamsToJoin: PropTypes.bool.isRequired,
        myTeamMembers: PropTypes.object.isRequired,
        isOpen: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        locale: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
            switchTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.altKey) {
            const {currentTeamId} = this.props;
            const teams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale);

            if (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN)) {
                e.preventDefault();
                const delta = Utils.isKeyPressed(e, Constants.KeyCodes.DOWN) ? 1 : -1;
                const pos = teams.findIndex((team) => team.id === currentTeamId);
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
                return;
            }

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
                if (Utils.isKeyPressed(e, digits[idx]) && idx < teams.length && teams[idx].id !== currentTeamId) {
                    e.preventDefault();
                    const team = teams[idx];
                    this.props.actions.switchTeam(`/${team.name}`);
                    return;
                }
            }
        }
    }

    componentDidMount() {
        this.props.actions.getTeams(0, 200);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.changeTeam);
    }

    render() {
        const root = document.querySelector('#root');
        if (this.props.myTeams.length <= 1) {
            root.classList.remove('multi-teams');
            return null;
        }
        root.classList.add('multi-teams');

        const plugins = [];
        const teams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale).
            map((team) => {
                const member = this.props.myTeamMembers[team.id];
                return (
                    <TeamButton
                        key={'switch_team_' + team.name}
                        url={`/${team.name}`}
                        tip={team.display_name}
                        active={team.id === this.props.currentTeamId}
                        displayName={team.display_name}
                        unread={member.msg_count > 0}
                        mentions={member.mention_count}
                        teamIconUrl={Utils.imageURLForTeam(team)}
                        switchTeam={this.props.actions.switchTeam}
                    />
                );
            });

        if (this.props.moreTeamsToJoin && !this.props.experimentalPrimaryTeam) {
            teams.push(
                <TeamButton
                    btnClass='team-btn__add'
                    key='more_teams'
                    url='/select_team'
                    tip={
                        <FormattedMessage
                            id='team_sidebar.join'
                            defaultMessage='Other teams you can join.'
                        />
                    }
                    content={'+'}
                    switchTeam={this.props.actions.switchTeam}
                />
            );
        } else {
            teams.push(
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
                                defaultMessage='Create a New Team'
                            />
                        }
                        content={'+'}
                        switchTeam={this.props.actions.switchTeam}
                    />
                </SystemPermissionGate>
            );
        }

        plugins.push(
            <div
                key='team-sidebar-bottom-plugin'
                className='team-sidebar-bottom-plugin is-empty'
            >
                <Pluggable pluggableName='BottomTeamSidebar'/>
            </div>
        );

        return (
            <div className={classNames('team-sidebar', {'move--right': this.props.isOpen})}>
                <div className='team-wrapper'>
                    <Scrollbars
                        autoHide={true}
                        autoHideTimeout={500}
                        autoHideDuration={500}
                        renderThumbHorizontal={renderThumbHorizontal}
                        renderThumbVertical={renderThumbVertical}
                        renderView={renderView}
                        onScroll={this.handleScroll}
                    >
                        {teams}
                    </Scrollbars>
                </div>
                {plugins}
            </div>
        );
    }
}
