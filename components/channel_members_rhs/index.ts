// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {createSelector} from 'reselect';

import {
    getCurrentChannel,
    getCurrentChannelStats,
    getMembersInCurrentChannel,
    isCurrentChannelArchived,
} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';
import {Constants} from 'utils/constants';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {
    getActiveProfilesInCurrentChannelWithoutSorting,
    getUserStatuses, searchActiveProfilesInCurrentChannel,
} from 'mattermost-redux/selectors/entities/users';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {openDirectChannelToUserId} from 'actions/channel_actions';
import {openModal} from 'actions/views/modals';
import {closeRightHandSide, goBack, setEditChannelMembers} from 'actions/views/rhs';
import {getIsEditingMembers, getPreviousRhsState} from 'selectors/rhs';
import {setChannelMembersRhsSearchTerm} from 'actions/views/search';
import {loadProfilesAndReloadChannelMembers, searchProfilesAndChannelMembers} from 'actions/user_actions';
import {Channel} from '@mattermost/types/channels';
import {loadMyChannelMemberAndRole} from 'mattermost-redux/actions/channels';

import RHS, {Props, ChannelMember} from './channel_members_rhs';

const getProfiles = createSelector(
    'getProfiles',
    getActiveProfilesInCurrentChannelWithoutSorting,
    getUserStatuses,
    getTeammateNameDisplaySetting,
    getMembersInCurrentChannel,
    getIsEditingMembers,
    (profilesInCurrentChannel, userStatuses, teammateNameDisplaySetting, membersInCurrentChannel, editing) => {
        const channelMembers: ChannelMember[] = [];
        profilesInCurrentChannel.forEach((profile) => {
            if (!membersInCurrentChannel[profile.id]) {
                return;
            }

            const member = {
                user: profile,
                membership: membersInCurrentChannel[profile.id],
                status: userStatuses[profile.id],
                displayName: displayUsername(profile, teammateNameDisplaySetting),
            } as ChannelMember;
            channelMembers.push(member);
        });

        // while editing members, their position might change in the list.
        // it's more efficiente to resort them here rather than requerying the server for
        // all the pages loaded so far.
        if (editing) {
            channelMembers.sort((a, b) => {
                if (a.membership?.scheme_admin === b.membership?.scheme_admin) {
                    return a.displayName.localeCompare(b.displayName);
                }

                if (a.membership?.scheme_admin === true) {
                    return -1;
                }
                return 1;
            });
        }

        return channelMembers;
    },
);

const searchProfiles = createSelector(
    'searchProfiles',
    (state: GlobalState, search: string) => searchActiveProfilesInCurrentChannel(state, search, false),
    getUserStatuses,
    getTeammateNameDisplaySetting,
    getMembersInCurrentChannel,
    (profilesInCurrentChannel, userStatuses, teammateNameDisplaySetting, membersInCurrentChannel) => {
        const channelMembers: ChannelMember[] = [];
        profilesInCurrentChannel.forEach((profile) => {
            channelMembers.push({
                user: profile,
                membership: membersInCurrentChannel[profile.id],
                status: userStatuses[profile.id],
                displayName: displayUsername(profile, teammateNameDisplaySetting),
            });
        });
        return channelMembers;
    },
);

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

    const isArchived = isCurrentChannelArchived(state);
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const canManageMembers = haveIChannelPermission(
        state,
        currentTeam.id,
        channel.id,
        isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
    ) && !isArchived;

    const searchTerms = state.views.search.channelMembersRhsSearch || '';

    let channelMembers: ChannelMember[] = [];
    if (searchTerms === '') {
        channelMembers = getProfiles(state);
    } else {
        channelMembers = searchProfiles(state, searchTerms.trim());
    }

    const teamUrl = getCurrentRelativeTeamUrl(state);
    const canGoBack = Boolean(getPreviousRhsState(state));
    const editing = getIsEditingMembers(state);

    return {
        channel,
        membersCount,
        searchTerms,
        teamUrl,
        canGoBack,
        canManageMembers,
        channelMembers,
        editing,
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
            setEditChannelMembers,
            searchProfilesAndChannelMembers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RHS);
