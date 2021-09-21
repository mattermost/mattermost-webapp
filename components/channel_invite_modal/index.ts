// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, getProfilesInChannel,  searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel, getProfilesInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, getUserStatuses, makeGetProfilesNotInChannel, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';

import {addUsersToChannel} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {GlobalState} from 'types/store';

import ChannelInviteModal, {Props} from './channel_invite_modal';

type UserProfileValue = Value & UserProfile;

type InitialProps = {
    channelId: string;
    teamId: string;
}

function makeMapStateToProps(initialState: GlobalState, initialProps: InitialProps) {
    let doGetProfilesNotInChannel: (state: GlobalState, channelId: string, filters?: any) => UserProfile[];
    if (initialProps.channelId && initialProps.teamId) {
        doGetProfilesNotInChannel = makeGetProfilesNotInChannel();
    }

    let doGetProfilesInChannel: (state: GlobalState, channelId: string, filters?: any) => UserProfile[];
    if (initialProps.channelId && initialProps.teamId) {
        doGetProfilesInChannel = makeGetProfilesInChannel();
    }

    return (state: GlobalState, props: InitialProps) => {
        let profilesNotInCurrentChannel: UserProfileValue[];
        let profilesInCurrentChannel: UserProfileValue[];
        let profilesNotInCurrentTeam: UserProfileValue[];

        if (doGetProfilesNotInChannel) {
            profilesNotInCurrentChannel = doGetProfilesNotInChannel(state, props.channelId) as UserProfileValue[];
            profilesInCurrentChannel = doGetProfilesInChannel(state, props.channelId) as UserProfileValue[];
            profilesNotInCurrentTeam = getProfilesNotInTeam(state, props.teamId) as UserProfileValue[];
        } else {
            profilesNotInCurrentChannel = getProfilesNotInCurrentChannel(state) as UserProfileValue[];
            profilesInCurrentChannel = getProfilesInCurrentChannel(state) as UserProfileValue[];
            profilesNotInCurrentTeam = getProfilesNotInCurrentTeam(state) as UserProfileValue[];
        }

        const userStatuses = getUserStatuses(state);

        return {
            profilesNotInCurrentChannel,
            profilesInCurrentChannel,
            profilesNotInCurrentTeam,
            userStatuses,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Props['actions']>({
            addUsersToChannel,
            getProfilesNotInChannel,
            getProfilesInChannel,
            getTeamStats,
            loadStatusesForProfilesList,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ChannelInviteModal);
