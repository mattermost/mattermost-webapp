// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import {addChannelToCategory, renameCategory, deleteCategory} from 'mattermost-redux/actions/channel_categories';
import Permissions from 'mattermost-redux/constants/permissions';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {GenericAction} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {createCategory} from 'actions/views/channel_sidebar';
import SidebarCategoryMenu from './sidebar_category_menu';

type OwnProps = {
    category: ChannelCategory;
}

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

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            createCategory,
            deleteCategory,
            renameCategory,
            addChannelToCategory,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryMenu);
