// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel, getChannelsInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {haveIChannelPermission, haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getInviteToTeamTreatment} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig, getLicense, getSubscriptionStats} from 'mattermost-redux/selectors/entities/general';
import {getProfiles, searchProfiles as reduxSearchProfiles} from 'mattermost-redux/actions/users';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {searchChannels as reduxSearchChannels} from 'mattermost-redux/actions/channels';
import {regenerateTeamInviteId} from 'mattermost-redux/actions/teams';
import {Permissions} from 'mattermost-redux/constants';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

import {closeModal, CloseModalType} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers, Constants} from 'utils/constants';
import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {sendMembersInvites, sendGuestsInvites} from 'actions/invite_actions';

import {GlobalState} from 'mattermost-redux/types/store';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {InviteResults} from './result_view';
import InvitationModal from './invitation_modal';

const searchProfiles = (term: string, options = {}) => {
    if (!term) {
        return getProfiles(0, 20, options);
    }
    return reduxSearchProfiles(term, options);
};

const searchChannels = (teamId: string, term: string) => {
    return reduxSearchChannels(teamId, term);
};

export function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const license = getLicense(state);
    const channels = getChannelsInCurrentTeam(state);
    const currentTeam = getCurrentTeam(state);
    const currentChannel = getCurrentChannel(state);
    const subscriptionStats = getSubscriptionStats(state);
    const invitableChannels = channels.filter((channel) => {
        if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
            return false;
        }
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            return haveIChannelPermission(state, currentTeam.id, channel.id, Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS);
        }
        return haveIChannelPermission(state, currentTeam.id, channel.id, Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);
    });
    const guestAccountsEnabled = config.EnableGuestAccounts === 'true';
    const emailInvitationsEnabled = config.EnableEmailInvitations === 'true';
    const isLicensed = license && license.IsLicensed === 'true';
    const isGroupConstrained = Boolean(currentTeam.group_constrained);
    const canInviteGuests = !isGroupConstrained && isLicensed && guestAccountsEnabled && haveICurrentTeamPermission(state, Permissions.INVITE_GUEST);
    const isCloud = license.Cloud === 'true';
    const isFreeTierWithNoFreeSeats = isCloud && subscriptionStats?.is_paid_tier === 'false' && subscriptionStats?.remaining_seats <= 0;

    const canAddUsers = haveICurrentTeamPermission(state, Permissions.ADD_USER_TO_TEAM);
    const inviteToTeamTreatment = getInviteToTeamTreatment(state) || InviteToTeamTreatments.NONE;
    return {
        invitableChannels,
        currentTeam,
        canInviteGuests,
        canAddUsers,
        isFreeTierWithNoFreeSeats,
        emailInvitationsEnabled,
        show: isModalOpen(state, ModalIdentifiers.INVITATION),
        isCloud,
        isAdmin: isAdmin(getCurrentUser(state).roles),
        cloudUserLimit: config.ExperimentalCloudUserLimit || '10',
        inviteToTeamTreatment,
        currentChannelName: currentChannel.display_name,
        subscriptionStats,
    };
}

type Actions = {
    closeModal: () => void;
    sendGuestsInvites: (teamId: string, channels: Channel[], users: UserProfile[], emails: string[], message: string) => Promise<{data: InviteResults}>;
    sendMembersInvites: (teamId: string, users: UserProfile[], emails: string[]) => Promise<{data: InviteResults}>;
    regenerateTeamInviteId: (teamId: string) => void;
    searchProfiles: (term: string, options?: Record<string, string>) => Promise<{data: UserProfile[]}>;
    searchChannels: (teamId: string, term: string) => ActionFunc;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | CloseModalType>, Actions>({
            closeModal: () => closeModal(ModalIdentifiers.INVITATION),
            sendGuestsInvites,
            sendMembersInvites,
            regenerateTeamInviteId,
            searchProfiles,
            searchChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitationModal);
