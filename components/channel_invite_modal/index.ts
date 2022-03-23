// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, getUserStatuses, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';
import {Action, ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import {Value} from 'components/multiselect/multiselect';

import {addUsersToChannel} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';

import {GlobalState} from 'types/store';

import ChannelInviteModal from './channel_invite_modal';

type UserProfileValue = Value & UserProfile;

type OwnProps = {
    channelId?: string;
    teamId?: string;
}

function makeMapStateToProps() {
    const doGetProfilesNotInChannel = makeGetProfilesNotInChannel();

    return (state: GlobalState, props: OwnProps) => {
        let profilesNotInCurrentChannel: UserProfileValue[];
        let profilesNotInCurrentTeam: UserProfileValue[];

        if (props.channelId && props.teamId) {
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

type Actions = {
    addUsersToChannel: (channelId: string, userIds: string[]) => Promise<ActionResult>;
    getProfilesNotInChannel: (teamId: string, channelId: string, groupConstrained: boolean, page: number, perPage?: number) => Promise<ActionResult>;
    getTeamStats: (teamId: string) => void;
    loadStatusesForProfilesList: (users: UserProfile[]) => void;
    searchProfiles: (term: string, options: any) => Promise<ActionResult>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            addUsersToChannel,
            getProfilesNotInChannel,
            getTeamStats,
            loadStatusesForProfilesList,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ChannelInviteModal);
