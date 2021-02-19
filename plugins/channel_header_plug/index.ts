// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {doAppCall} from 'actions/apps';
import {GlobalState} from 'types/store';

import {appsEnabled} from 'utils/apps';

import ChannelHeaderPlug from './channel_header_plug';
import { AppCall } from 'mattermost-redux/types/apps';

function mapStateToProps(state: GlobalState) {
    const apps = appsEnabled(state);
    return {
        components: state.plugins.components.ChannelHeaderButton || [],
        appBindings: apps ? getAppBindings(state, AppBindingLocations.CHANNEL_HEADER_ICON) : [],
        appsEnabled: apps,
        theme: getTheme(state),
    };
}

type Actions = {
    doAppCall: (call: AppCall) => Promise<ActionResult>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
