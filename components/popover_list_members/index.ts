// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {createSelector} from 'reselect';

import {getAllChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserStatuses, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';
import {getTeammateNameDisplaySetting, getAddMembersToChannel} from 'mattermost-redux/selectors/entities/preferences';
import {UserProfile} from 'mattermost-redux/types/users';
import {Channel} from 'mattermost-redux/types/channels';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {loadProfilesAndStatusesInChannel} from 'actions/user_actions.jsx';
import {openModal} from 'actions/views/modals';

import {canManageMembers} from 'utils/channel_utils';
import {sortUsersByStatusAndDisplayName} from 'utils/utils.jsx';

import PopoverListMembers, {Props} from './popover_list_members';

type Filters = {
    role?: string;
    inactive?: boolean;
    active?: boolean;
    roles?: string[];
    exclude_roles?: string[];
    channel_roles?: string[];
    team_roles?: string[];
};

const makeSortUsersByStatusAndDisplayName = (doGetProfilesInChannel: (state: GlobalState, channelId: Channel['id'], filters?: Filters) => UserProfile[]) => {
    return createSelector(
        'makeSortUsersByStatusAndDisplayName',
        (state: GlobalState, channelId: Channel['id']) => doGetProfilesInChannel(state, channelId),
        getUserStatuses,
        getTeammateNameDisplaySetting,
        (users, statuses, teammateNameDisplay) => sortUsersByStatusAndDisplayName(users, statuses, teammateNameDisplay),
    );
};

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();
    const doSortUsersByStatusAndDisplayName = makeSortUsersByStatusAndDisplayName(doGetProfilesInChannel);

    return function mapStateToProps(state: GlobalState, ownProps: Props) {
        const stats = getAllChannelStats(state)[ownProps.channel.id] || {};
        const statuses = getUserStatuses(state);

        return {
            currentUserId: getCurrentUserId(state),
            memberCount: stats.member_count,
            statuses,
            teamUrl: getCurrentRelativeTeamUrl(state),
            manageMembers: canManageMembers(state, ownProps.channel),
            sortedUsers: doSortUsersByStatusAndDisplayName(state, ownProps.channel.id),
            addMembersABTest: getAddMembersToChannel(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Props['actions']>({
            openModal,
            loadProfilesAndStatusesInChannel,
            openDirectChannelToUserId,
        }, dispatch),
    };
}
export default connect(makeMapStateToProps, mapDispatchToProps)(PopoverListMembers);
