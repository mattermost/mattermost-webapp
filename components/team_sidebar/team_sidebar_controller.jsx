// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';
import classNames from 'classnames';

import TeamStore from 'stores/team_store.jsx';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';

import * as Utils from 'utils/utils.jsx';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

import TeamButton from './components/team_button.jsx';

export default class TeamSidebar extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        enableTeamCreation: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = this.getStateFromStores();
    }

    getStateFromStores =() => {
        const teamMembers = TeamStore.getMyTeamMembers();
        const currentTeamId = TeamStore.getCurrentId();

        return {
            teams: TeamStore.getAll(),
            teamListings: TeamStore.getTeamListings(),
            teamMembers,
            currentTeamId,
            show: teamMembers && teamMembers.length > 1,
            isMobile: Utils.isMobile(),
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        TeamStore.addChangeListener(this.onChange);
        TeamStore.addUnreadChangeListener(this.onChange);
        this.props.actions.getTeams(0, 200);
        this.setStyles();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        TeamStore.removeChangeListener(this.onChange);
        TeamStore.removeUnreadChangeListener(this.onChange);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.isMobile) {
            $('.team-wrapper').perfectScrollbar();
        }

        // reset the scrollbar upon switching teams
        if (this.state.currentTeam !== prevState.currentTeam) {
            this.refs.container.scrollTop = 0;
            if (!this.state.isMobile) {
                $('.team-wrapper').perfectScrollbar('update');
            }
        }
    }

    onChange = () => {
        this.setState(this.getStateFromStores());
        this.setStyles();
    }

    handleResize = () => {
        const teamMembers = this.state.teamMembers;
        this.setState({show: teamMembers && teamMembers.length > 1});
        this.setStyles();
    }

    setStyles = () => {
        const root = document.querySelector('#root');

        if (this.state.show) {
            root.classList.add('multi-teams');
        } else {
            root.classList.remove('multi-teams');
        }
    }

    render() {
        if (!this.state.show) {
            return null;
        }

        const myTeams = [];
        const isAlreadyMember = new Map();
        let moreTeams = false;

        for (const index in this.state.teamMembers) {
            if (this.state.teamMembers.hasOwnProperty(index)) {
                const teamMember = this.state.teamMembers[index];
                if (teamMember.delete_at > 0) {
                    continue;
                }
                const teamId = teamMember.team_id;
                myTeams.push(Object.assign({
                    unread: teamMember.msg_count > 0,
                    mentions: teamMember.mention_count,
                }, this.state.teams[teamId]));
                isAlreadyMember[teamId] = true;
            }
        }

        for (const id in this.state.teamListings) {
            if (this.state.teamListings.hasOwnProperty(id) && !isAlreadyMember[id]) {
                moreTeams = true;
                break;
            }
        }

        const teams = filterAndSortTeamsByDisplayName(myTeams).
            map((team) => {
                return (
                    <TeamButton
                        key={'switch_team_' + team.name}
                        url={`/${team.name}`}
                        tip={team.display_name}
                        active={team.id === this.state.currentTeamId}
                        isMobile={this.state.isMobile}
                        displayName={team.display_name}
                        unread={team.unread}
                        mentions={team.mentions}
                        teamIconUrl={Utils.imageURLForTeam(team)}
                    />
                );
            });

        if (moreTeams && !this.props.experimentalPrimaryTeam) {
            teams.push(
                <TeamButton
                    btnClass='team-btn__add'
                    key='more_teams'
                    url='/select_team'
                    isMobile={this.state.isMobile}
                    tip={
                        <FormattedMessage
                            id='team_sidebar.join'
                            defaultMessage='Other teams you can join.'
                        />
                    }
                    content={<i className='fa fa-plus'/>}
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
                        isMobile={this.state.isMobile}
                        tip={
                            <FormattedMessage
                                id='navbar_dropdown.create'
                                defaultMessage='Create a New Team'
                            />
                        }
                        content={<i className='fa fa-plus'/>}
                    />
                </SystemPermissionGate>
            );
        }

        return (
            <div className={classNames('team-sidebar', {'move--right': this.props.isOpen})}>
                <div className='team-wrapper'>
                    {teams}
                </div>
            </div>
        );
    }
}
