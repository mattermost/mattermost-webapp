// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {
    getCurrentUserId,
    getStatusForUserId,
} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import Option from './option.jsx';

function mapStateToProps(state, ownProps) {
    const status = getStatusForUserId(state, ownProps.option.id);
    const profilePicture = Client4.getProfilePictureUrl(ownProps.option.id, ownProps.option.last_picture_update);

    return {
        currentUserId: getCurrentUserId(state),
        profilePicture,
        status,
    };
}

export default connect(mapStateToProps)(Option);
