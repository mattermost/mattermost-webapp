// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {imageURLForTeam} from 'utils/utils.jsx';

export default class TeamInList extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
    }

    render() {
        const {team} = this.props;
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
                </div>
            );
        }
        return (
            <div className='team-info-block'>
                <span className='icon'>{icon}</span>
                <div className='team-data'>
                    <div className='title'>{team.display_name}</div>
                </div>
            </div>
        );
    }
}
