// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import TeamImage from '../team_image.jsx';
import * as Utils from 'utils/utils';

export default class TeamRow extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        onRowClick: PropTypes.func.isRequired,
    };

    handleRowClick = () => {
        const {team, onRowClick} = this.props;
        onRowClick(team.id);
    }
    render = () => {
        const {team} = this.props;
        const teamIconUrl = Utils.imageURLForTeam(team);
        return (
            <div
                className={'group '}
                onClick={this.handleRowClick}
            >
                <div className='group-row'>
                    <TeamImage
                        small={true}
                        teamIconUrl={teamIconUrl}
                        displayName={team.display_name}
                    />
                    <span className='group-name'>
                        {team.display_name}
                    </span>
                    <span className='group-description'>
                        <FormattedMessage
                            id={`admin.team_settings.team_row.managementMethod.${team.group_constrained ? 'group' : 'manual'}`}
                            defaultMessage={team.group_constrained ? 'Group Sync' : 'Manual Invites'}
                        />
                    </span>
                    <span className='group-actions'>
                        <Link to={`/admin_console/user_management/teams/${team.id}`}>
                            <FormattedMessage
                                id='admin.team_settings.team_row.configure'
                                defaultMessage='Edit'
                            />
                        </Link>
                    </span>
                </div>
            </div>
        );
    };
}
