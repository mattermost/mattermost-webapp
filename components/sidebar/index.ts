
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ChannelCategoryTypes} from 'mattermost-redux/action_types';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import Permissions from 'mattermost-redux/constants/permissions';
import {getCategoryIdsForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction, DispatchFunc, GetStateFunc, ActionFunc} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar';

function mockCreateCategory(teamId: string, categoryName: string) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({
            type: ChannelCategoryTypes.RECEIVED_CATEGORY,
            data: {
                id: `${teamId}-${categoryName}`,
                team_id: teamId,
                type: CategoryTypes.CUSTOM,
                display_name: categoryName,
                channel_ids: [],
            },
        });

        const currentCategoryIds = Array.from(getCategoryIdsForTeam(getState(), teamId)!);
        const indexOfFavorites = currentCategoryIds.findIndex((id) => id.includes('favorites'));
        currentCategoryIds.splice(indexOfFavorites || 1, 0, `${teamId}-${categoryName}`);

        dispatch({
            type: ChannelCategoryTypes.RECEIVED_CATEGORY_ORDER,
            data: {
                teamId,
                categoryIds: currentCategoryIds,
            },
        });

        return {data: `${teamId}-${categoryName}`};
    };
}

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
    createCategory: (teamId: string, categoryName: string) => {data: string};
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createCategory: mockCreateCategory,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
