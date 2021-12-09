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

import { joinChannelById, switchToChannel } from 'actions/views/channel';

import ShareMessageModal, {Props} from './share_message_modal';

type UserProfileValue = Value & UserProfile;

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(ShareMessageModal);
