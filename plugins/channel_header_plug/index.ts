// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {appsEnabled, makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {GenericAction} from 'mattermost-redux/types/actions';

import {HandleBindingClick, PostEphemeralCallResponseForChannel} from 'types/apps';

import {handleBindingClick, postEphemeralCallResponseForChannel} from 'actions/apps';
import {GlobalState} from 'types/store';

import ChannelHeaderPlug from './channel_header_plug';

const getChannelHeaderBindings = makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON);

function mapStateToProps(state: GlobalState) {
    const apps = appsEnabled(state);
    return {
        components: state.plugins.components.ChannelHeaderButton,
        appBindings: getChannelHeaderBindings(state),
        appsEnabled: apps,
        theme: getTheme(state),
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
