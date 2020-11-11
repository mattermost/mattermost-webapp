// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {Team} from 'mattermost-redux/types/teams';

import * as Utils from 'utils/utils';
import TeamIcon from 'components/widgets/team_icon/team_icon';

type Props = {
    team: Team,
    onRowClick(id: string): void
}
export default class TeamRow extends React.PureComponent<Props> {
    handleRowClick = () => {
        const {team, onRowClick} = this.props;
        onRowClick(team.id);
    }

    renderManagementMethodText = () => {
        const {team} = this.props;
        if (team.group_constrained) {
            return (
                <FormattedMessage
                    id='admin.team_settings.team_row.managementMethod.groupSync'
                    defaultMessage='Group Sync'
                />
            );
        } else if (team.allow_open_invite) {
            return (
                <FormattedMessage
                    id='admin.team_settings.team_row.managementMethod.anyoneCanJoin'
                    defaultMessage='Anyone Can Join'
                />
            );
        }
        return (
            <FormattedMessage
                id='admin.team_settings.team_row.managementMethod.inviteOnly'
                defaultMessage='Invite Only'
            />
        );
    }

    render = () => {
        const {team} = this.props;
        const teamIconUrl = Utils.imageURLForTeam(team);
        return (
            <div
                className='group'
                onClick={this.handleRowClick}
            >
                <div className='group-row group-row-large'>
                    <div className='group-name adjusted center-row row-content'>
                        <TeamIcon
                            size='sm'
                            url={teamIconUrl}
                            name={team.display_name}
                        />
                        <div>
                            <b data-testid='team-display-name'>{team.display_name}</b>
                            {team.description && (
                                <div className='overflow--ellipsis text-nowrap team-descr-list-column'>
                                    {team.description}
                                </div>)}

                        </div>

                    </div>
                    <div className='group-content'>
                        <span className='group-description adjusted row-content'>
                            {this.renderManagementMethodText()}
                        </span>
                        <span
                            data-testid={`${team.display_name}edit`}
                            className='group-actions'
                        >
                            <Link to={`/admin_console/user_management/teams/${team.id}`}>
                                <FormattedMessage
                                    id='admin.team_settings.team_row.configure'
                                    defaultMessage='Edit'
                                />
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        );
    };
}
