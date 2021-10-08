// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {appsEnabled, makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {GlobalState} from 'types/store';
import {AppCallRequest, AppCallType, AppForm} from 'mattermost-redux/types/apps';
import {ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {doAppCall, openAppsModal} from 'actions/apps';

import MobileChannelHeaderPlug from './mobile_channel_header_plug';

const getChannelHeaderBindings = makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON);

function mapStateToProps(state: GlobalState) {
    const apps = appsEnabled(state);
    return {
        appBindings: getChannelHeaderBindings(state),
        appsEnabled: apps,
        channelMember: getMyCurrentChannelMembership(state),
        components: state.plugins.components.MobileChannelHeaderButton,
        theme: getTheme(state),
    };
}

type Actions = {
    doAppCall: (call: AppCallRequest, type: AppCallType) => Promise<ActionResult>;
    openAppsModal: (form: AppForm, call: AppCallRequest) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            doAppCall,
            openAppsModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileChannelHeaderPlug);
