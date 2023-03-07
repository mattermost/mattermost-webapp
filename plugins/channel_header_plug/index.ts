// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {Permissions} from 'mattermost-redux/constants';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {appBarEnabled, appsEnabled, getChannelHeaderAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {GenericAction} from 'mattermost-redux/types/actions';

import {HandleBindingClick, OpenAppsModal, PostEphemeralCallResponseForChannel} from 'types/apps';

import {handleBindingClick, openAppsModal, postEphemeralCallResponseForChannel} from 'actions/apps';
import {GlobalState} from 'types/store';

import {openModal} from 'actions/views/modals';

import {getChannelHeaderPluginComponents, shouldShowAppBar} from 'selectors/plugins';

import {ModalData} from 'types/actions';

import {isMarketplaceEnabled} from 'mattermost-redux/selectors/entities/general';

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
        shouldShowAppBar: shouldShowAppBar(state),
        canOpenMarketplace: (
            isMarketplaceEnabled(state) &&
            haveICurrentTeamPermission(state, Permissions.SYSCONSOLE_WRITE_PLUGINS)
        ),
    };
}

type Actions = {
    handleBindingClick: HandleBindingClick;
    postEphemeralCallResponseForChannel: PostEphemeralCallResponseForChannel;
    openAppsModal: OpenAppsModal;
    openModal: <P>(modalData: ModalData<P>) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            handleBindingClick,
            postEphemeralCallResponseForChannel,
            openAppsModal,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
