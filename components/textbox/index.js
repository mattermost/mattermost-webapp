// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getCurrentUserId, makeGetProfilesInChannel, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';

import {autocompleteUsersInChannel, scrollPostList} from 'actions/views/channel';

import Textbox from './textbox.jsx';

const makeMapStateToProps = () => {
    const getProfilesInChannel = makeGetProfilesInChannel();
    const getProfilesNotInChannel = makeGetProfilesNotInChannel();

    return (state, ownProps) => ({
        currentUserId: getCurrentUserId(state),
        profilesInChannel: getProfilesInChannel(state, ownProps.channelId, true),
        profilesNotInChannel: getProfilesNotInChannel(state, ownProps.channelId, true),
    });
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
        scrollPostList,
    }, dispatch),
});

export default connect(makeMapStateToProps, mapDispatchToProps, null, {withRef: true})(Textbox);
