// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';
import classNames from 'classnames';

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

    componentDidMount() {
        this.props.actions.getTeams(0, 200);
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
                                defaultMessage='Create a Team'
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
