// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {getAssociatedGroupsForReference} from 'mattermost-redux/selectors/entities/groups';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import Permissions from 'mattermost-redux/constants/permissions';

import {getCurrentUserId, makeGetProfilesInChannel, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import {autocompleteUsersInChannel} from 'actions/views/channel';
import {searchAssociatedGroupsForReference} from 'actions/views/group';
import {autocompleteChannels} from 'actions/channel_actions';

import Textbox from './textbox';

type Props = {
    channelId: string;
};

/* eslint-disable camelcase */

const makeMapStateToProps = () => {
    const getProfilesInChannel = makeGetProfilesInChannel();
    const getProfilesNotInChannel = makeGetProfilesNotInChannel();

    return (state: GlobalState, ownProps: Props) => {
        const teamId = getCurrentTeamId(state);
        const license = getLicense(state);
        const useGroupMentions = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true' && haveIChannelPermission(state, {
            channel: ownProps.channelId,
            team: teamId,
            permission: Permissions.USE_GROUP_MENTIONS,
        });
        const autocompleteGroups = useGroupMentions ? getAssociatedGroupsForReference(state, teamId, ownProps.channelId) : null;

        return {
            currentUserId: getCurrentUserId(state),
            currentTeamId: teamId,
            profilesInChannel: getProfilesInChannel(state, ownProps.channelId, {active: true}),
            profilesNotInChannel: getProfilesNotInChannel(state, ownProps.channelId, {active: true}),
            autocompleteGroups,
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
        autocompleteChannels,
        searchAssociatedGroupsForReference,
    }, dispatch),
});

export default connect(makeMapStateToProps, mapDispatchToProps, null, {forwardRef: true})(Textbox);

