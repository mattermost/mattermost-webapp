// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentTeam, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';

import CloseMessage from './close_message';

const mapStateToProps = (state) => {
    return {
        currentTeam: getCurrentTeam(state),
        redirectChannel: getRedirectChannelNameForTeam(state, getCurrentTeamId(state)),
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({savePreferences}, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CloseMessage);
