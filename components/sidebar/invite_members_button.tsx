// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {useIntl, FormattedMessage} from 'react-intl';

import {useSelector, useDispatch} from 'react-redux';

import {Permissions} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {getTotalUsersStats} from 'mattermost-redux/actions/users';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import InvitationModal from 'components/invitation_modal';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import Constants, {ModalIdentifiers} from 'utils/constants';

type Props = {
    touchedInviteMembersButton: boolean;
    className?: string;
    onClick: () => void;
}

const InviteMembersButton: React.FC<Props> = (props: Props): JSX.Element | null => {
    const dispatch = useDispatch<DispatchFunc>();

    const intl = useIntl();
    const currentTeamId = useSelector(getCurrentTeamId);
    const totalUserCount = useSelector((state: GlobalState) => state.entities.users.stats?.total_users_count);

    useEffect(() => {
        if (!totalUserCount) {
            dispatch(getTotalUsersStats());
        }
    }, []);

    let buttonClass = 'SidebarChannelNavigator_inviteMembersLhsButton';

    if (!props.touchedInviteMembersButton && Number(totalUserCount) <= Constants.USER_LIMIT) {
        buttonClass += ' SidebarChannelNavigator_inviteMembersLhsButton--untouched';
    }

    if (!currentTeamId || !totalUserCount) {
        return null;
    }

    return (
        <TeamPermissionGate
            teamId={currentTeamId}
            permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
        >
            <ToggleModalButtonRedux
                ariaLabel={intl.formatMessage({id: 'sidebar_left.inviteUsers', defaultMessage: 'Invite Users'})}
                id='introTextInvite'
                className={`intro-links color--link cursor--pointer${props.className ? ` ${props.className}` : ''}`}
                modalId={ModalIdentifiers.INVITATION}
                dialogType={InvitationModal}
                onClick={props.onClick}
            >
                <li
                    className={buttonClass}
                    aria-label={intl.formatMessage({id: 'sidebar_left.sidebar_channel_navigator.inviteUsers', defaultMessage: 'Invite Members'})}
                >
                    <i className='icon-plus-box'/>
                    <FormattedMessage
                        id={'sidebar_left.inviteMembers'}
                        defaultMessage='Invite Members'
                    />
                </li>
            </ToggleModalButtonRedux>
        </TeamPermissionGate>
    );
};

export default InviteMembersButton;
