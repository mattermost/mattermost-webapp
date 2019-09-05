// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {imageURLForTeam} from 'utils/utils.jsx';

import './team_icon.scss';

type Props = {
    url?: string;
    team: {
        display_name: string;
        id?: string;
    };
};

export default class TeamIcon extends React.PureComponent<Props> {
    public render() {
        const {team, url} = this.props;
        const teamIconUrl = url || imageURLForTeam(team);
        let icon = null;
        if (teamIconUrl) {
            icon = (
                <div
                    className='TeamIcon__image'
                    style={{backgroundImage: `url('${teamIconUrl}')`}}
                />
            );
        } else {
            icon = (
                <div className='TeamIcon__initials'>
                    {team.display_name ? team.display_name.replace(/\s/g, '').substring(0, 2) : '??'}
                </div>
            );
        }
        return (
            <div className='TeamIconBlock'>
                <span className='TeamIcon__icon'>{icon}</span>
                <div className='TeamIcon__data'>
                    <div className='TeamIcon__data__title'>{team.display_name}</div>
                </div>
            </div>
        );
    }
}
