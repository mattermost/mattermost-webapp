// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {ServerError} from '@mattermost/types/errors';
import {UserProfile} from '@mattermost/types/users';
import {Group} from '@mattermost/types/groups';

import {GlobalState} from 'types/store';

import {getProfilesInGroup, searchProfilesInGroup} from 'mattermost-redux/selectors/entities/users';
import {getProfilesInGroup as getUsersInGroup} from 'mattermost-redux/actions/users';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {openDirectChannelToUserId} from 'actions/channel_actions';
import {closeRightHandSide} from 'actions/views/rhs';

import GroupMemberList from './group_member_list';

type Actions = {
    getUsersInGroup: (groupId: string, page: number, perPage: number) => Promise<{data: UserProfile[]}>;
    openDirectChannelToUserId: (userId?: string) => Promise<{error: ServerError}>;
    closeRightHandSide: () => void;
};

type OwnProps = {
    group: Group;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const searchTerm = state.views.search.popoverSearch;

    let users: UserProfile[] = [];
    if (searchTerm) {
        users = searchProfilesInGroup(state, ownProps.group.id, searchTerm);
    } else {
        users = getProfilesInGroup(state, ownProps.group.id);
    }

    const nameDisplaySetting = getTeammateNameDisplaySetting(state);

    return {
        users,
        searchTerm,
        nameDisplaySetting,
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getUsersInGroup,
            openDirectChannelToUserId,
            closeRightHandSide,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupMemberList);
