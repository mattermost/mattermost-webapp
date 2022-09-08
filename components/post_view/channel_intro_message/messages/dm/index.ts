// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel, getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getDisplayNameByUser} from 'utils/utils';
import {GlobalState} from 'types/store';

import DMIntroMessage from './dm';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const teammate = getDirectTeammate(state, channel.id);

    return {
        channel,
        teammate,
        teammateName: getDisplayNameByUser(state, teammate),
    };
}

export default connect(mapStateToProps)(DMIntroMessage);
