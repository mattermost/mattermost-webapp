// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

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

        // TODO temp
        const root = document.querySelector('#root');
        if (teams.length <= 1) {
            root!.classList.remove('multi-teams');
            return null;
        }
        root!.classList.add('multi-teams');

        return (
            <div id='TeamSidebar'>
                <div className='TeamSidebarWrapper'>
                    {'Team Sidebar Placeholder'}
                    {renderedTeams}
                </div>
            </div>
        );
    }
}
