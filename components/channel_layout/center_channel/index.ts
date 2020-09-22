// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';

import {getIsRhsOpen, getIsRhsMenuOpen} from 'selectors/rhs';
import {getIsLhsOpen} from 'selectors/lhs';
import {getLastViewedChannelNameByTeamName} from 'selectors/local_storage';

import {GlobalState} from 'types/store';

import CenterChannel from './center_channel';

type Props = {
    match: {
        url: string;
        params: {
            team: string;
        };
    };
};

const mapStateToProps = (state: GlobalState, ownProps: Props) => {
    let channelName = getLastViewedChannelNameByTeamName(state, ownProps.match.params.team);
    if (!channelName) {
        const team = getTeamByName(state, ownProps.match.params.team);
        channelName = getRedirectChannelNameForTeam(state, team!.id);
    }
    const lastChannelPath = `${ownProps.match.url}/channels/${channelName}`;
    return {
        lastChannelPath,
        lhsOpen: getIsLhsOpen(state),
        rhsOpen: getIsRhsOpen(state),
        rhsMenuOpen: getIsRhsMenuOpen(state),
    };
};

export default connect(mapStateToProps)(CenterChannel);
