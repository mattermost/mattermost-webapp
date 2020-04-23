// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import Permissions from 'mattermost-redux/constants/permissions';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {GlobalState} from 'mattermost-redux/types/store';

import SidebarCategoryMenu from './sidebar_category_menu';

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
            canCreatePrivateChannel,
            canCreatePublicChannel,
            isMuted: false, // TODO
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryMenu);
