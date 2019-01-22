// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';

import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';
import {selectChannel} from 'mattermost-redux/actions/channels';

import AppRoute from './app_route.jsx';

function mapsStateToProps(state, ownProps) {
    const channelId = (getChannelByName(state, ownProps.match.params.channel) || {}).id;
    return {
        channelId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            selectChannel,
        }, dispatch),
    };
}

export default withRouter(connect(mapsStateToProps, mapDispatchToProps)(AppRoute));
