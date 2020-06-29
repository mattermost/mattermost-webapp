// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getGroupStats} from 'mattermost-redux/actions/groups';
import {searchProfiles, getProfilesInGroup} from 'mattermost-redux/actions/users';

import {getGroupMemberCount} from 'mattermost-redux/selectors/entities/groups';
import {getProfilesInGroup as selectProfiles, searchProfilesInGroup} from 'mattermost-redux/selectors/entities/users';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import {setModalSearchTerm} from 'actions/views/search';

import {GlobalState} from 'types/store';

import MemberListGroup from './member_list_group';

type Props = {
    groupID: string;
}

type Actions = {
    getProfilesInGroup: (groupID: string, page: number, perPage: number) => Promise<{data: {}}>;
    getGroupStats: (groupID: string) => Promise<{data: {}}>;
    searchProfiles: (term: string, options?: {}) => Promise<{data: UserProfile[]}>;
    setModalSearchTerm: (term: string) => Promise<{
        data: boolean;
    }>;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {groupID} = ownProps;
    const searchTerm = state.views.search.modalSearch;
    let users;
    if (searchTerm) {
        users = searchProfilesInGroup(state, groupID, searchTerm);
    } else {
        users = selectProfiles(state, groupID);
    }

    return {
        searchTerm,
        users,
        total: getGroupMemberCount(state, groupID) || 0,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getProfilesInGroup,
            searchProfiles,
            setModalSearchTerm,
            getGroupStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListGroup);
