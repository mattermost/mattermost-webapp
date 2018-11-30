// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getCurrentUserId, getProfilesInCurrentChannel, getProfilesNotInCurrentChannel} from 'mattermost-redux/selectors/entities/users';

import {autocompleteUsersInChannel} from 'actions/views/channel';

import Textbox from './textbox.jsx';

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
