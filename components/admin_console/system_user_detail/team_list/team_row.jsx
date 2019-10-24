// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './team_row.scss';

export default class TeamRow extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
    };
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
    renderTeamRole = (team, user) => {
        const isSysAdmin = Utils.isSystemAdmin(user.roles);
        const isAdmin = team.scheme_admin && !isSysAdmin;
        const isGuest = Utils.isGuest(user);
        if (isGuest) {
            return (
                <FormattedMessage
                    id={'admin.system_users.guest'}
                    defaultMessage={'Guest'}
                />
            );
        } else if (isSysAdmin) {
            return (
                <FormattedMessage
                    id={'admin.system_users.system_admin'}
                    defaultMessage={'System Admin'}
                />
            );
        } else if (isAdmin) {
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
        const {team, user} = this.props;
        const teamIconUrl = Utils.imageURLForTeam(team);
        return (
            <div className={'TeamRow'}>
                <div className='TeamRow__row'>
                    <div className='TeamRow__team-name'>
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
                                <div className='overflow--ellipsis text-nowrap TeamRow__team-description'>
                                    {team.description}
                                </div>)}
                        </div>

                    </div>

                    <span className='TeamRow__description'>
                        {this.renderTeamType(team)}
                    </span>

                    <span className='TeamRow__description'>
                        {this.renderTeamRole(team, user)}
                    </span>
                </div>
            </div>
        );
    };
}
