// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getAppsBindings} from 'mattermost-redux/selectors/entities/plugins';
import AppBindings from 'mattermost-redux/constants/plugins';

import ChannelHeaderPlug from './channel_header_plug.jsx';
import {doAppCall} from 'actions/apps';

function mapStateToProps(state) {
    return {
        components: state.plugins.components.ChannelHeaderButton,
        appsBindings: getAppsBindings(state, AppBindings.APP_BINDING_CHANNEL_HEADER_ICON),
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
