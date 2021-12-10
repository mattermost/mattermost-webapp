// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, getUserStatuses, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';
import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import { getTeam } from 'mattermost-redux/selectors/entities/teams';

import { GlobalState } from 'mattermost-redux/types/store';

import {Value} from 'components/multiselect/multiselect';

import { joinChannelById, switchToChannel } from 'actions/views/channel';

import ShareMessageModal from './share_message_modal';

type Props = {
    channelId: string,

    teamId: string,
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

function mapStateToProps(state: GlobalState, props: Props) {
    const channel = getChannel(state, props.channelId);
    const team = getTeam(state, props.teamId);

    return {
        channelDisplayName: channel.display_name,
        teamDisplayName: team.display_name,
        channel: channel,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareMessageModal);

// const connector = connect(mapStateToProps, mapDispatchToProps);

// export type PropsFromRedux = ConnectedProps<typeof connector>;

// export default connector(ShareMessageModal);