// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import {Team} from 'mattermost-redux/types/teams';
import TeamButton from './team_button';

type Props = {
    teams: Team[];
};

type State = {

};

export default class TeamSidebar extends React.PureComponent<Props, State> {
    renderTeam = (team: Team) => {
        return (
            <TeamButton team={team}/>
        );
    }

    render() {
        const {teams} = this.props;
        const renderedTeams = teams.map(this.renderTeam);

        return (
            <div className='team-sidebar'>
                {'Team Sidebar Placeholder'}
                {renderedTeams}
            </div>
        );
    }
}
