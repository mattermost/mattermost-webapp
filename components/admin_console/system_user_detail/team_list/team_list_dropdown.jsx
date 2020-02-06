// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';
import EllipsisHorizontalIcon from 'components/widgets/icons/ellipsis_h_icon';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

export default class TeamListDropdown extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        doRemoveUserFromTeam: PropTypes.func.isRequired,
        doMakeUserTeamAdmin: PropTypes.func.isRequired,
        doMakeUserTeamMember: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: null,
        };
    }

    render() {
        const {team} = this.props;
        const isAdmin = team.scheme_admin;
        const isMember = team.scheme_user && !team.scheme_admin;
        const isGuest = team.scheme_guest;
        const showMakeTeamAdmin = !isAdmin && !isGuest;
        const showMakeTeamMember = !isMember && !isGuest;

        return (
            <MenuWrapper>
                <button
                    id={`teamListDropdown_${team.id}`}
                    className='dropdown-toggle theme color--link style--none'
                    type='button'
                    aria-expanded='true'
                >
                    <span className='SystemUserDetail__actions-menu-icon'><EllipsisHorizontalIcon/></span>
                </button>
                <div>
                    <Menu
                        openLeft={true}
                        openUp={false}
                        ariaLabel={localizeMessage('team_members_dropdown.menuAriaLabel', 'Team member role change')}
                    >
                        <Menu.ItemAction
                            id='makeTeamAdmin'
                            show={showMakeTeamAdmin}
                            onClick={() => this.props.doMakeUserTeamAdmin(team.id)}
                            text={localizeMessage('team_members_dropdown.makeAdmin', 'Make Team Admin')}
                        />
                        <Menu.ItemAction
                            show={showMakeTeamMember}
                            onClick={() => this.props.doMakeUserTeamMember(team.id)}
                            text={localizeMessage('team_members_dropdown.makeMember', 'Make Team Member')}
                        />
                        <Menu.ItemAction
                            id='removeFromTeam'
                            show={true}
                            onClick={() => this.props.doRemoveUserFromTeam(team.id)}
                            text={localizeMessage('team_members_dropdown.leave_team', 'Remove from Team')}
                            buttonClass='SystemUserDetail__action-remove-team'
                        />
                    </Menu>
                </div>
            </MenuWrapper>
        );
    }
}