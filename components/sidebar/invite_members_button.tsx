// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PlusBoxIcon} from '@mattermost/compass-icons/components';

import classNames from 'classnames';
import React, {useEffect} from 'react';

import {useIntl, FormattedMessage} from 'react-intl';

import {useSelector, useDispatch} from 'react-redux';

import {Permissions} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {getTotalUsersStats} from 'mattermost-redux/actions/users';

import ToggleModalButton from 'components/toggle_modal_button';
import InvitationModal from 'components/invitation_modal';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import Constants, {ModalIdentifiers} from 'utils/constants';

import {Grid} from '@mattermost/compass-ui';

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
    }, [dispatch, totalUserCount]);

    if (!currentTeamId || !totalUserCount) {
        return null;
    }

    return (
        <TeamPermissionGate
            teamId={currentTeamId}
            permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
        >
            <Grid mx={2}>
                <ToggleModalButton
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.inviteUsers', defaultMessage: 'Invite Users'})}
                    id='introTextInvite'
                    className={classNames(
                        'intro-links',
                        'cursor--pointer',
                        props.className,
                        {'SidebarChannelNavigator_inviteMembersLhsButton--untouched': !props.touchedInviteMembersButton && Number(totalUserCount) <= Constants.USER_LIMIT},
                    )}
                    modalId={ModalIdentifiers.INVITATION}
                    dialogType={InvitationModal}
                    onClick={props.onClick}
                    startIcon={<PlusBoxIcon/>}
                >
                    <FormattedMessage
                        id={'sidebar_left.inviteMembers'}
                        defaultMessage='Invite Members'
                    />
                </ToggleModalButton>
            </Grid>
        </TeamPermissionGate>
    );
};

export default InviteMembersButton;
