// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils';

import TeamImage from './team_image.jsx';

import './team_row.scss';

export default class TeamRow extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
    };
T
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
            <div className={'TeamRow'}>
                <div className='TeamRow__row'>
                    <div className='TeamRow__name'>
                        <div className='col-sm-auto'>
                            <TeamImage
                                small={true}
                                teamIconUrl={teamIconUrl}
                                displayName={team.display_name}
                            />

                        </div>
                        <div className='col-sm-auto'>
                            <b>{team.display_name}</b>
                            {team.description && (
                                <div className='overflow--ellipsis text-nowrap TeamRow__description'>
                                    {team.description}
                                </div>)}
                        </div>

                    </div>

                    <span className='TeamRow__description'>
                        {this.renderTeamType(team)}
                    </span>

                    <span className='TeamRow__description'>
                        {this.renderTeamRole(team)}
                    </span>
                </div>
            </div>
        );
    };
}