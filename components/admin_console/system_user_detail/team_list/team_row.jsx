// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
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
    renderTeamType = (team) => {
        if (team.group_constrained) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamType.groupSync'}
                    defaultMessage={'Group Sync'}
                />
            );
        }
        if (team.allow_open_invite) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamType.anyoneCanJoin'}
                    defaultMessage={'Anyone can join'}
                />
            );
        }
        return (
            <FormattedMessage
                id={'admin.systemUserDetail.teamList.teamType.inviteOnly'}
                defaultMessage={'Invite only'}
            />
        );
    }
    renderTeamRole = (team) => {
        if (team.scheme_admin) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamRole.admin'}
                    defaultMessage={'Admin'}
                />
            );
        }
        return (
            <FormattedMessage
                id={'admin.systemUserDetail.teamList.teamRole.member'}
                defaultMessage={'Member'}
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
                    <div className='group-name'>
                        <div className='col-sm-auto'>
                            <TeamIcon
                                size='sm'
                                url={teamIconUrl}
                                name={team.display_name}
                            />
                        </div>
                        <div className='col-sm-auto'>
                            <b>{team.display_name}</b>
                            {team.description && (
                                <div className='overflow--ellipsis text-nowrap TeamRow__col-description'>
                                    {team.description}
                                </div>)}
                        </div>

                    </div>

                    <span className='group-description'>
                        {this.renderTeamType(team)}
                    </span>

                    <span className='group-description'>
                        {this.renderTeamRole(team)}
                    </span>
                </div>
            </div>
        );
    };
}