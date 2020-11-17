// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getChannelsInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {haveIChannelPermission, haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getProfiles, searchProfiles as reduxSearchProfiles} from 'mattermost-redux/actions/users';
import {searchChannels as reduxSearchChannels} from 'mattermost-redux/actions/channels';
import {getTeam} from 'mattermost-redux/actions/teams';
import {Permissions} from 'mattermost-redux/constants';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers, Constants} from 'utils/constants';
import {sendMembersInvites, sendGuestsInvites} from 'actions/invite_actions';

import InvitationModal from './invitation_modal.jsx';

const searchProfiles = (term, options = {}) => {
    if (!term) {
        return getProfiles(0, 20, options);
    }
    return reduxSearchProfiles(term, options);
};

const searchChannels = (teamId, term) => {
    return reduxSearchChannels(teamId, term);
};

export function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);
    const channels = getChannelsInCurrentTeam(state);
    const currentTeam = getCurrentTeam(state);
    const invitableChannels = channels.filter((channel) => {
        if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
            return false;
        }
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            return haveIChannelPermission(state, {channel: channel.id, team: currentTeam.id, permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS});
        }
        return haveIChannelPermission(state, {channel: channel.id, team: currentTeam.id, permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS});
    });
    const guestAccountsEnabled = config.EnableGuestAccounts === 'true';
    const emailInvitationsEnabled = config.EnableEmailInvitations === 'true';
    const isLicensed = license && license.IsLicensed === 'true';
    const isGroupConstrained = Boolean(currentTeam.group_constrained);
    const canInviteGuests = !isGroupConstrained && isLicensed && guestAccountsEnabled && haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.INVITE_GUEST});

    const canAddUsers = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.ADD_USER_TO_TEAM});
    return {
        invitableChannels,
        currentTeam,
        canInviteGuests,
        canAddUsers,
        emailInvitationsEnabled,
        show: isModalOpen(state, ModalIdentifiers.INVITATION),
        isCloud: license.Cloud === 'true',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal: () => closeModal(ModalIdentifiers.INVITATION),
            sendGuestsInvites,
            sendMembersInvites,
            searchProfiles,
            searchChannels,
            getTeam,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitationModal);
