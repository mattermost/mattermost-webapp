// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getAppsBindings} from 'mattermost-redux/selectors/entities/apps';
import {AppsBindings} from 'mattermost-redux/constants/apps';
import {GenericAction} from 'mattermost-redux/types/actions';

import {doAppCall} from 'actions/apps';
import {GlobalState} from 'types/store';

import ChannelHeaderPlug from './channel_header_plug';

function mapStateToProps(state: GlobalState) {
    return {
        components: state.plugins.components.ChannelHeaderButton || [],
        appBindings: getAppsBindings(state, AppsBindings.CHANNEL_HEADER_ICON),
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
