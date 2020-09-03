
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {fetchMyCategories} from 'mattermost-redux/actions/channel_categories';
import {Preferences} from 'mattermost-redux/constants';
import Permissions from 'mattermost-redux/constants/permissions';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {createCategory} from 'actions/views/channel_sidebar';
import {openModal} from 'actions/views/modals';
import {GlobalState} from 'types/store';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar';

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state);
    const config = getConfig(state);
    const isDataPrefechEnabled = config.ExperimentalDataPrefetch === 'true';
    const currentChannelId = getCurrentChannelId(state);

    let canCreatePublicChannel = false;
    let canCreatePrivateChannel = false;
    let canJoinPublicChannel = false;

    if (currentTeam) {
        canCreatePublicChannel = haveIChannelPermission(state, {channel: currentChannelId, team: currentTeam.id, permission: Permissions.CREATE_PUBLIC_CHANNEL});
        canCreatePrivateChannel = haveIChannelPermission(state, {channel: currentChannelId, team: currentTeam.id, permission: Permissions.CREATE_PRIVATE_CHANNEL});
        canJoinPublicChannel = haveIChannelPermission(state, {channel: currentChannelId, team: currentTeam.id, permission: Permissions.JOIN_PUBLIC_CHANNELS});
    }

    return {
        teamId: currentTeam ? currentTeam.id : '',
        canCreatePrivateChannel,
        canCreatePublicChannel,
        canJoinPublicChannel,
        isOpen: getIsLhsOpen(state),
        isDataPrefechEnabled,
        hasSeenModal: getBool(
            state,
            Preferences.CATEGORY_WHATS_NEW_MODAL,
            Preferences.HAS_SEEN_SIDEBAR_WHATS_NEW_MODAL,
            false,
        ),
        isCloud: getLicense(state).Cloud === 'true',
    };
}

type Actions = {
    fetchMyCategories: (teamId: string) => {data: boolean};
    createCategory: (teamId: string, categoryName: string) => {data: string};
    openModal: (modalData: {modalId: string; dialogType: React.Component; dialogProps?: any}) => Promise<{
        data: boolean;
    }>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createCategory,
            fetchMyCategories,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
