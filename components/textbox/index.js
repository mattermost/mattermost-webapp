// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {autocompleteUsers} from 'mattermost-redux/actions/users';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getProfilesInCurrentChannel, getProfilesNotInCurrentChannel} from 'mattermost-redux/selectors/entities/users';

import Textbox from './textbox.jsx';

const autocompleteUsersInChannel = (prefix) => (dispatch, getState) => {
    const state = getState();
    const currentTeamId = getCurrentTeamId(state);
    const currentChannelId = getCurrentChannelId(state);

    return dispatch(autocompleteUsers(prefix, currentTeamId, currentChannelId));
};

const mapStateToProps = (state) => ({
    currentUserId: getCurrentUserId(state),
    profilesInChannel: getProfilesInCurrentChannel(state),
    profilesNotInChannel: getProfilesNotInCurrentChannel(state),
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Textbox);
