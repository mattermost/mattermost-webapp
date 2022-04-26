// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {
    getCurrentChannel,
    getCurrentChannelStats,
    getMembersInCurrentChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';
import {Constants} from 'utils/constants';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {
    getProfilesInCurrentChannel,
    getUserStatuses, searchProfilesInCurrentChannel,
} from 'mattermost-redux/selectors/entities/users';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {openDirectChannelToUserId} from 'actions/channel_actions';
import {openModal} from 'actions/views/modals';
import {closeRightHandSide, goBack} from 'actions/views/rhs';
import {getPreviousRhsState} from 'selectors/rhs';
import {UserProfile} from 'mattermost-redux/types/users';
import {setChannelMembersRhsSearchTerm} from 'actions/views/search';
import {loadProfilesAndReloadChannelMembers} from 'actions/user_actions';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import * as UserUtils from 'mattermost-redux/utils/user_utils';
import {loadMyChannelMemberAndRole} from 'mattermost-redux/actions/channels';

import RHS, {Props, ChannelMember} from './channel_members_rhs';

function isChannelAdmin(channelMember: ChannelMembership) {
    return UserUtils.isChannelAdmin(channelMember.roles) || channelMember.scheme_admin;
}

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);
    const {member_count: membersCount} = getCurrentChannelStats(state) || {member_count: 0};

    if (!channel) {
        return {
            channel: {} as Channel,
            channelMembers: [],
            channelAdmins: [],
            searchTerms: '',
            membersCount,
            canManageMembers: false,
            canGoBack: false,
            teamUrl: '',
        } as unknown as Props;
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const canManageMembers = haveIChannelPermission(state, currentTeam.id, channel.id, isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);

    const searchTerms = state.views.search.channelMembersRhsSearch || '';
    let profilesInCurrentChannel: UserProfile[];

    if (searchTerms === '') {
        profilesInCurrentChannel = getProfilesInCurrentChannel(state);
    } else {
        profilesInCurrentChannel = searchProfilesInCurrentChannel(state, searchTerms.trim(), false);
    }

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
            // group by role unless we are doing a search
            if (isChannelAdmin(member.membership) && searchTerms === '') {
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
        membersCount,
        searchTerms,
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
            setChannelMembersRhsSearchTerm,
            loadProfilesAndReloadChannelMembers,
            loadMyChannelMemberAndRole,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RHS);
