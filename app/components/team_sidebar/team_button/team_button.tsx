// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import {Team} from 'mattermost-redux/types/teams';

type Props = {
    team: Team;
};

type State = {

};

export default class TeamButton extends React.PureComponent<Props, State> {
    render() {
        const {team} = this.props;

        return (
            <Link to={`/${team.name}`}>{team.display_name}</Link>
        );
    }
}
