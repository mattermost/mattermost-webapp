// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentTeam, getCurrentTeamId, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel, getChannelsInCurrentTeam, getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {haveIChannelPermission, haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getProfiles, searchProfiles as reduxSearchProfiles} from 'mattermost-redux/actions/users';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {searchChannels as reduxSearchChannels} from 'mattermost-redux/actions/channels';
import {regenerateTeamInviteId} from 'mattermost-redux/actions/teams';
import {Permissions} from 'mattermost-redux/constants';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {CloseModalType} from 'actions/views/modals';
import {Constants, CloudProducts} from 'utils/constants';
import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {
    sendMembersInvites,
    sendGuestsInvites,
    sendMembersInvitesToChannels,
} from 'actions/invite_actions';
import {makeAsyncComponent} from 'components/async_load';

import {GlobalState} from 'types/store';

import {Channel} from '@mattermost/types/channels';
import {UserProfile} from '@mattermost/types/users';

import type {InviteResults} from './result_view';

const InvitationModal = makeAsyncComponent('InvitationModal', React.lazy(() => import('./invitation_modal')));

const searchProfiles = (term: string, options = {}) => {
    if (!term) {
        return getProfiles(0, 20, options);
    }
    return reduxSearchProfiles(term, options);
};

const searchChannels = (teamId: string, term: string) => {
    return reduxSearchChannels(teamId, term);
};

type OwnProps = {
    channelToInvite?: Channel;
}

export function mapStateToProps(state: GlobalState, props: OwnProps) {
    const config = getConfig(state);
    const license = getLicense(state);
    const channels = getChannelsInCurrentTeam(state);
    const channelsByName = getChannelsNameMapInCurrentTeam(state);
    const townSquareDisplayName = channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || Constants.DEFAULT_CHANNEL_UI_NAME;

    const currentTeamId = getCurrentTeamId(state);
    const currentTeam = currentTeamId === '' && props.channelToInvite ? getTeam(state, props.channelToInvite.team_id) : getCurrentTeam(state);
    const currentChannel = getCurrentChannel(state);
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

    const subscription = state.entities.cloud.subscription;
    const subscriptionProduct = getSubscriptionProduct(state);

    const isStarter = subscriptionProduct?.sku === CloudProducts.STARTER;

    const isCloudFreeTrial = subscription?.is_free_trial === 'true';

    const isPaidSubscription = isCloud && !isStarter && !isCloudFreeTrial;

    const canAddUsers = haveICurrentTeamPermission(state, Permissions.ADD_USER_TO_TEAM);

    return {
        invitableChannels,
        currentTeam,
        canInviteGuests,
        canAddUsers,
        emailInvitationsEnabled,
        isCloud,
        isAdmin: isAdmin(getCurrentUser(state).roles),
        currentChannel,
        townSquareDisplayName,
        isCloudFreeTrial,
        isPaidSubscription,
    };
}

type Actions = {
    sendGuestsInvites: (teamId: string, channels: Channel[], users: UserProfile[], emails: string[], message: string) => Promise<{data: InviteResults}>;
    sendMembersInvites: (teamId: string, users: UserProfile[], emails: string[]) => Promise<{data: InviteResults}>;
    sendMembersInvitesToChannels: (teamId: string, channels: Channel[], users: UserProfile[], emails: string[], message: string) => Promise<{data: InviteResults}>;
    regenerateTeamInviteId: (teamId: string) => void;
    searchProfiles: (term: string, options?: Record<string, string>) => Promise<{data: UserProfile[]}>;
    searchChannels: (teamId: string, term: string) => ActionFunc;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | CloseModalType>, Actions>({
            sendGuestsInvites,
            sendMembersInvites,
            sendMembersInvitesToChannels,
            regenerateTeamInviteId,
            searchProfiles,
            searchChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitationModal);
