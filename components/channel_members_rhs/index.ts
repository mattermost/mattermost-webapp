// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannel, getMembersInCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';
import {Constants} from 'utils/constants';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {
    getProfilesInCurrentChannel,
    getUserStatuses,
} from 'mattermost-redux/selectors/entities/users';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {isInRole} from 'utils/utils';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {openDirectChannelToUserId} from 'actions/channel_actions';
import {openModal} from 'actions/views/modals';
import {closeRightHandSide, goBack} from 'actions/views/rhs';

import {getPreviousRhsState} from '../../selectors/rhs';

import RHS, {Props, ChannelMember} from './channel_members_rhs';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const canManageMembers = haveIChannelPermission(state, currentTeam.id, channel.id, isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);

    const profilesInCurrentChannel = getProfilesInCurrentChannel(state);
    const userStatuses = getUserStatuses(state);
    const teammateNameDisplaySetting = getTeammateNameDisplaySetting(state);
    const membersInCurrentChannel = getMembersInCurrentChannel(state);

    const channelAdmins: ChannelMember[] = [];
    const channelMembers: ChannelMember[] = [];
    profilesInCurrentChannel.forEach((profile) => {
        const member = {
            user: profile,
            membership: membersInCurrentChannel[profile.id],
            status: userStatuses[profile.id],
            displayName: displayUsername(profile, teammateNameDisplaySetting),
        } as ChannelMember;

        if (member.membership) {
            if (isInRole(member.membership.roles, Constants.PERMISSIONS_CHANNEL_ADMIN)) {
                channelAdmins.push(member);
                return;
            }
            channelMembers.push(member);
        }
    });

    const teamUrl = getCurrentRelativeTeamUrl(state);
    const canGoBack = Boolean(getPreviousRhsState(state));

    return {
        channel,
        teamUrl,
        canGoBack,
        canManageMembers,
        channelMembers,
        channelAdmins,
    } as Props;
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            openModal,
            openDirectChannelToUserId,
            closeRightHandSide,
            goBack,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RHS);
