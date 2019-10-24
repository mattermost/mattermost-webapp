// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils';
import TeamIcon from 'components/widgets/team_icon/team_icon';

export default class TeamRow extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        onRowClick: PropTypes.func.isRequired,
    };

    handleRowClick = () => {
        const {team, onRowClick} = this.props;
        onRowClick(team.id);
    }

    renderManagementMethodText = () => {
        const {team: {group_constrained, allow_open_invite}} = this.props;
        if (group_constrained) {
            return (
                <FormattedMessage
                    id={'admin.team_settings.team_row.managementMethod.groupSync'}
                    defaultMessage={'Group sync'}
                />
            );
        } else if (allow_open_invite) {
            return (
                <FormattedMessage
                    id={'admin.team_settings.team_row.managementMethod.anyoneCanJoin'}
                    defaultMessage={'Anyone can join'}
                />
            );
        }
        return (
            <FormattedMessage
                id={'admin.team_settings.team_row.managementMethod.inviteOnly'}
                defaultMessage={'Invite only'}
            />
        );

    }

    render = () => {
        const {team} = this.props;
        const teamIconUrl = Utils.imageURLForTeam(team);
        return (
            <div
                className={'group '}
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
                            <b>{team.display_name}</b>
                            {team.description && (
                                <div className='overflow--ellipsis text-nowrap team-descr-list-column'>
                                    {team.description}
                                </div>)}

                        </div>

                    </div>

                    <span className='group-description adjusted row-content'>
                        {this.renderManagementMethodText()}
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
