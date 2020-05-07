// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators, ActionCreatorsMapObject} from 'redux';

import {ChannelCategoryTypes} from 'mattermost-redux/action_types';
import Permissions from 'mattermost-redux/constants/permissions';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {GenericAction, ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {mockCreateCategory, moveToCategory} from 'actions/views/channel_sidebar';

import SidebarCategoryMenu from './sidebar_category_menu';

// TODO Devin: Replace with `renameCategory`
function mockRenameCategory(category: ChannelCategory, newName: string) {
    return (dispatch: DispatchFunc) => {
        const renamedCategory = {
            ...category,
            display_name: newName,
        };

        return dispatch({
            type: ChannelCategoryTypes.RECEIVED_CATEGORY,
            data: renamedCategory,
        });
    };
}

function mockDeleteCategory(category: ChannelCategory) {
    return (dispatch: DispatchFunc) => {
        return dispatch({
            type: ChannelCategoryTypes.CATEGORY_DELETED,
            data: category,
        });
    };
}

type OwnProps = {
    category: ChannelCategory;
}

function makeMapStateToProps() {
    return (state: GlobalState, ownProps: OwnProps) => {
        const currentTeam = getCurrentTeam(state);

        let canCreatePublicChannel = false;
        let canCreatePrivateChannel = false;

        if (currentTeam) {
            canCreatePublicChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PUBLIC_CHANNEL});
            canCreatePrivateChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PRIVATE_CHANNEL});
        }

        return {
            currentTeamId: currentTeam.id,
            canCreatePrivateChannel,
            canCreatePublicChannel,
        };
    };
}

type Actions = {
    createCategory: (teamId: string, categoryName: string) => {data: string};
    deleteCategory: (category: ChannelCategory) => void;
    renameCategory: (category: ChannelCategory, newName: string) => void;
    moveToCategory: (teamId: string, channelId: string, newCategoryId: string) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createCategory: mockCreateCategory,
            deleteCategory: mockDeleteCategory,
            renameCategory: mockRenameCategory,
            moveToCategory: moveToCategory as any,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryMenu);
