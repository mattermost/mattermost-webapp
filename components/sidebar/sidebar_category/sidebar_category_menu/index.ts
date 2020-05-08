// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators, ActionCreatorsMapObject} from 'redux';

import {addChannelToCategory, renameCategory, deleteCategory} from 'mattermost-redux/actions/channel_categories';
import Permissions from 'mattermost-redux/constants/permissions';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {GlobalState} from 'mattermost-redux/types/store';

import {createCategory} from 'actions/views/channel_sidebar';

import SidebarCategoryMenu from './sidebar_category_menu';

function makeMapStateToProps() {
    return (state: GlobalState) => {
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
    createCategory: (teamId: string, displayName: string, channelIds?: string[] | undefined) => {data: ChannelCategory};
    deleteCategory: (categoryId: string) => void;
    renameCategory: (categoryId: string, displayName: string) => void;
    addChannelToCategory: (categoryId: string, channelId: string) => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createCategory,
            deleteCategory,
            renameCategory,
            addChannelToCategory,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryMenu);
