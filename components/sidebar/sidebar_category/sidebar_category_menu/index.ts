// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators, ActionCreatorsMapObject} from 'redux';

import {renameCategory, deleteCategory} from 'mattermost-redux/actions/channel_categories';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {GlobalState} from 'mattermost-redux/types/store';

import {createCategory} from 'actions/views/channel_sidebar';

import SidebarCategoryMenu from './sidebar_category_menu';

function makeMapStateToProps() {
    return (state: GlobalState) => {
        const currentTeam = getCurrentTeam(state);

        return {
            currentTeamId: currentTeam.id,
        };
    };
}

type Actions = {
    createCategory: (teamId: string, displayName: string, channelIds?: string[] | undefined) => {data: ChannelCategory};
    deleteCategory: (categoryId: string) => void;
    renameCategory: (categoryId: string, displayName: string) => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createCategory,
            deleteCategory,
            renameCategory,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryMenu);
