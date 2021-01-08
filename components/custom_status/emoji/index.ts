// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

import {GlobalState} from 'types/store';

import CustomStatusEmoji from './custom_status_emoji';

function mapStateToProps(state: GlobalState) {
    const currentUser = getCurrentUser(state);
    return {
        currentUser,
    };
}

export default connect(mapStateToProps)(CustomStatusEmoji);
