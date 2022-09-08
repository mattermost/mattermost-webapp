// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getProfilesInCurrentChannel, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getChannelIntroPluginComponents} from 'selectors/plugins';
import {GlobalState} from 'types/store';

import GMIntroMessage from './gm';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const boardComponent = getChannelIntroPluginComponents(state).find((c) => c.pluginId === 'focalboard');

    return {
        currentUserId: getCurrentUserId(state),
        channel,
        channelProfiles: getProfilesInCurrentChannel(state),
        boardComponent,
    };
}

export default connect(mapStateToProps)(GMIntroMessage);
