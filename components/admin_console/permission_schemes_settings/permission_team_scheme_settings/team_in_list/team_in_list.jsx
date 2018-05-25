// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import TeamInfo from 'components/team_info';

export default class TeamInList extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        onRemoveTeam: PropTypes.func,
    }

    render() {
        const team = this.props.team;
        return (
            <div
                className='team'
                key={team.id}
            >
                <TeamInfo team={team}/>
                <a
                    className='remove'
                    onClick={() => this.props.onRemoveTeam(team.id)}
                >
                    <FormattedMessage
                        id='admin.permissions.teamScheme.removeTeam'
                        defaultMessage='Remove'
                    />
                </a>
            </div>
        );
    }
}
