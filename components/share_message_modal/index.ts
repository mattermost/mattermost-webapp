// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, getUserStatuses, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';

import {addUsersToChannel} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {GlobalState} from 'types/store';

import ShareMessageModal from './share_message_modal';

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

    return (state: GlobalState, props: InitialProps) => {
        let profilesNotInCurrentChannel: UserProfileValue[];
        let profilesNotInCurrentTeam: UserProfileValue[];

        if (doGetProfilesNotInChannel) {
            profilesNotInCurrentChannel = doGetProfilesNotInChannel(state, props.channelId) as UserProfileValue[];
            profilesNotInCurrentTeam = getProfilesNotInTeam(state, props.teamId) as UserProfileValue[];
        } else {
            profilesNotInCurrentChannel = getProfilesNotInCurrentChannel(state) as UserProfileValue[];
            profilesNotInCurrentTeam = getProfilesNotInCurrentTeam(state) as UserProfileValue[];
        }

        const userStatuses = getUserStatuses(state);

        return {
            profilesNotInCurrentChannel,
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
            getTeamStats,
            loadStatusesForProfilesList,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ShareMessageModal);
