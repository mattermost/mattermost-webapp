// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel, getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getChannelIntroPluginComponents} from 'selectors/plugins';
import {getDisplayNameByUser} from 'utils/utils';
import {GlobalState} from 'types/store';

import DMIntroMessage from './dm';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const teammate = getDirectTeammate(state, channel.id);
    const boardComponent = getChannelIntroPluginComponents(state).find((c) => c.pluginId === 'focalboard');

    return {
        channel,
        teammate,
        teammateName: getDisplayNameByUser(state, teammate),
        boardComponent,
    };
}

export default connect(mapStateToProps)(DMIntroMessage);
