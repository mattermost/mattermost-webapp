// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {imageURLForTeam} from 'utils/utils.jsx';

export default class TeamInList extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        stats: PropTypes.object,
        actions: PropTypes.shape({
            loadTeamStats: PropTypes.func.isRequired,
        }).isRequired,
    }

    componentDidMount() {
        this.props.actions.loadTeamStats(this.props.team.id);
    }

    render() {
        const {team, stats} = this.props;
        let totalMembers = 0;
        if (stats && stats[team.id]) {
            totalMembers = stats[team.id].total_member_count;
        }
        const teamIconUrl = imageURLForTeam(team);
        let icon = null;
        if (teamIconUrl) {
            icon = (
                <div
                    className='team-btn__image'
                    style={{backgroundImage: `url('${teamIconUrl}')`}}
                />
            );
        } else {
            icon = (
                <div className='team-btn__initials'>
                    {team.display_name ? team.display_name.replace(/\s/g, '').substring(0, 2) : '??'}
                    <div className='team-btn__content'>
                        {team.display_name}
                    </div>
                </div>
            );
        }
        return (
            <div className='team-info-block'>
                <span className='icon'>{icon}</span>
                <div className='team-data'>
                    <div className='title'>{team.display_name}</div>
                    <div className='members'>
                        <FormattedMessage
                            id='admin.team_info.numMembers'
                            defaultMessage='{count} {count, plural, one {Member} other {Members}}'
                            values={{count: totalMembers}}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
