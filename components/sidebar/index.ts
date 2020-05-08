
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {fetchMyCategories} from 'mattermost-redux/actions/channel_categories';
import Permissions from 'mattermost-redux/constants/permissions';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {createCategory} from 'actions/views/channel_sidebar';
import {GlobalState} from 'types/store';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar';

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state);

    let canCreatePublicChannel = false;
    let canCreatePrivateChannel = false;
    let canJoinPublicChannel = false;

    if (currentTeam) {
        canCreatePublicChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PUBLIC_CHANNEL});
        canCreatePrivateChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PRIVATE_CHANNEL});
        canJoinPublicChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.JOIN_PUBLIC_CHANNELS});
    }

    return {
        teamId: currentTeam.id,
        canCreatePrivateChannel,
        canCreatePublicChannel,
        canJoinPublicChannel,
        isOpen: getIsLhsOpen(state),
    };
}

type Actions = {
    fetchMyCategories: (teamId: string) => {data: boolean};
    createCategory: (teamId: string, categoryName: string) => {data: string};
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createCategory,
            fetchMyCategories,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
