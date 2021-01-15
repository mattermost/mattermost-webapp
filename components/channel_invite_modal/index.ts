// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';

import {addUsersToChannel} from 'actions/channel_actions';
import {GlobalState} from 'types/store';

import ChannelInviteModal from './channel_invite_modal';

type UserProfileValue = Value & UserProfile;

type Props = {
    channelId: string;
    teamId: string;
}

function makeMapStateToProps(initialState: GlobalState, initialProps: Props) {
    let doGetProfilesNotInChannel: (state: GlobalState, channelId: string, filters?: any) => UserProfile[];
    if (initialProps.channelId && initialProps.teamId) {
        doGetProfilesNotInChannel = makeGetProfilesNotInChannel();
    }

    return (state: GlobalState, props: Props) => {
        let profilesNotInCurrentChannel: UserProfileValue[];
        let profilesNotInCurrentTeam: UserProfileValue[];

        if (doGetProfilesNotInChannel) {
            profilesNotInCurrentChannel = doGetProfilesNotInChannel(state, props.channelId) as UserProfileValue[];
            profilesNotInCurrentTeam = getProfilesNotInTeam(state, props.teamId) as UserProfileValue[];
        } else {
            profilesNotInCurrentChannel = getProfilesNotInCurrentChannel(state) as UserProfileValue[];
            profilesNotInCurrentTeam = getProfilesNotInCurrentTeam(state) as UserProfileValue[];
        }

        return {
            profilesNotInCurrentChannel,
            profilesNotInCurrentTeam,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            addUsersToChannel,
            getProfilesNotInChannel,
            getTeamStats,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ChannelInviteModal);
