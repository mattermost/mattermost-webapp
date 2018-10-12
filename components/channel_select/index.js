// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/general';
import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import ChannelSelect from './channel_select.jsx';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state);
    return {
        channels: getMyChannels(state).sort(sortChannelsByTypeAndDisplayName.bind(null, currentUser.locale)),
    };
}

export default connect(mapStateToProps)(ChannelSelect);
