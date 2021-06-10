// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentTeam,
    getCurrentRelativeTeamUrl,
    getTeamMember,
} from 'mattermost-redux/selectors/entities/teams';
import {
    getChannelMembersInChannels,
    canManageAnyChannelMembersInCurrentTeam,
    getCurrentChannelId,
} from 'mattermost-redux/selectors/entities/channels';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getMembershipForEntities} from 'actions/views/profile_popover';
import {closeModal, openModal} from 'actions/views/modals';

import {areTimezonesEnabledAndSupported, getCurrentUserTimezone} from 'selectors/general';
import {getRhsState, getSelectedPost} from 'selectors/rhs';

import {makeGetCustomStatus, isCustomStatusEnabled, isCustomStatusExpired} from 'selectors/views/custom_status';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {GlobalState} from '../../types/store';

import {ServerError} from 'mattermost-redux/types/errors';

import ProfilePopover from './profile_popover';

type OwnProps = {
    userId: string;
    channelId?: string;
}

function getDefaultChannelId(state: GlobalState) {
    const selectedPost = getSelectedPost(state);
    return selectedPost.exists ? selectedPost.channel_id : getCurrentChannelId(state);
}

function makeMapStateToProps() {
    const getCustomStatus = makeGetCustomStatus();

    return (state: GlobalState, {userId, channelId = getDefaultChannelId(state)}: OwnProps) => {
        const team = getCurrentTeam(state);
        const teamMember = getTeamMember(state, team.id, userId);

        const isTeamAdmin = Boolean(teamMember && teamMember.scheme_admin);
        const channelMember = getChannelMembersInChannels(state)?.[channelId]?.[userId];

        let isChannelAdmin = false;
        if (getRhsState(state) !== 'search' && channelMember != null && channelMember.scheme_admin) {
            isChannelAdmin = true;
        }

        const customStatus = getCustomStatus(state, userId);
        return {
            currentTeamId: team.id,
            currentUserId: getCurrentUserId(state),
            enableTimezone: areTimezonesEnabledAndSupported(state),
            isTeamAdmin,
            isChannelAdmin,
            isInCurrentTeam: Boolean(teamMember) && teamMember?.delete_at === 0,
            canManageAnyChannelMembersInCurrentTeam: canManageAnyChannelMembersInCurrentTeam(state),
            status: getStatusForUserId(state, userId),
            teamUrl: getCurrentRelativeTeamUrl(state),
            user: getUser(state, userId),
            modals: state.views.modals,
            customStatus,
            isCustomStatusEnabled: isCustomStatusEnabled(state),
            isCustomStatusExpired: isCustomStatusExpired(state, customStatus),
            channelId,
            currentUserTimezone: getCurrentUserTimezone(state),
        };
    };
}

type Actions = {
    openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => Promise<{
        data: boolean;
    }>;
    closeModal: (modalId: string) => Promise<{
        data: boolean;
    }>;
    openDirectChannelToUserId: (userId?: string) => Promise<{error: ServerError}>;
    getMembershipForEntities: (teamId: string, userId: string, channelId?: string) => Promise<void>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            closeModal,
            openDirectChannelToUserId,
            openModal,
            getMembershipForEntities,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ProfilePopover);
