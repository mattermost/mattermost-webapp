// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './team_row.scss';
import TeamListDropdown from './team_list_dropdown';

type Props = {
    team: {[x: string]: string};
    onRowClick?: () => void;
    doRemoveUserFromTeam: (teamId: string) => Promise<void>;
    doMakeUserTeamAdmin: (teamId: string) => Promise<void>;
    doMakeUserTeamMember: (teamId: string) => Promise<void>;
}

export default class TeamRow extends React.PureComponent<Props, {}> {
    private renderTeamType = (team: {[x: string]: string}) => {
        if (team.group_constrained) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamType.groupSync'}
                    defaultMessage={'Group sync'}
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
    private renderTeamRole = (team: {[x: string]: string}) => {
        if (team.scheme_guest) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamRole.guest'}
                    defaultMessage={'Guest'}
                />
            );
        }
        if (team.scheme_admin && !team.scheme_guest) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamRole.admin'}
                    defaultMessage={'Team Admin'}
                />
            );
        }
        if (team.scheme_user && !team.scheme_guest && !team.scheme_admin) {
            return (
                <FormattedMessage
                    id={'admin.systemUserDetail.teamList.teamRole.member'}
                    defaultMessage={'Team Member'}
                />
            );
        }
        return null;
    }
    public render = (): JSX.Element => {
        const {team} = this.props;
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
                        <div className='col-md-auto'>
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
                        {this.renderTeamRole(team)}
                    </span>

                    <span className='TeamRow__actions'>
                        <TeamListDropdown
                            team={team}
                            doRemoveUserFromTeam={this.props.doRemoveUserFromTeam}
                            doMakeUserTeamAdmin={this.props.doMakeUserTeamAdmin}
                            doMakeUserTeamMember={this.props.doMakeUserTeamMember}
                        />
                    </span>
                </div>
            </div>
        );
    };
}
