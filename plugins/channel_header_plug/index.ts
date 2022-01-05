// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {appBarEnabled, appsEnabled, getChannelHeaderAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {GenericAction} from 'mattermost-redux/types/actions';

import {HandleBindingClick, PostEphemeralCallResponseForChannel} from 'types/apps';

import {handleBindingClick, postEphemeralCallResponseForChannel} from 'actions/apps';
import {GlobalState} from 'types/store';

import {getChannelHeaderPluginComponents} from 'selectors/plugins';

import ChannelHeaderPlug from './channel_header_plug';

function mapStateToProps(state: GlobalState) {
    const apps = appsEnabled(state);
    return {
        components: getChannelHeaderPluginComponents(state),
        appBindings: getChannelHeaderAppBindings(state),
        appsEnabled: apps,
        appBarEnabled: appBarEnabled(state),
        theme: getTheme(state),
        sidebarOpen: state.views.rhs.isSidebarOpen,
    };
}

type Actions = {
    handleBindingClick: HandleBindingClick;
    postEphemeralCallResponseForChannel: PostEphemeralCallResponseForChannel;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            handleBindingClick,
            postEphemeralCallResponseForChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
