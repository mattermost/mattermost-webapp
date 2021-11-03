// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {MarketplaceApp, MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import {GenericAction} from 'mattermost-redux/types/actions';

import {fetchListing} from 'actions/marketplace';

import {getPluggableId} from 'selectors/rhs';
import {getInstalledListing} from 'selectors/views/marketplace';

import {GlobalState} from 'types/store';

import AppBar from './app_bar';

const getChannelHeaderBindings = makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON);

const mapStateToProps = (state: GlobalState) => {
    const channelHeaderComponents = state.plugins.components.ChannelHeaderButton;

    const channel = getCurrentChannel(state);
    const marketplaceListing = getInstalledListing(state);

    const pluggableId = getPluggableId(state);
    const components = state.plugins.components.RightHandSidebarComponent;
    const component = components.find((c) => c.id === pluggableId);

    let activePluginId = '';
    if (component) {
        activePluginId = component.pluginId;
    }

    const appBarBindings = getChannelHeaderBindings(state);

    return {
        theme: getTheme(state),
        channelHeaderComponents,
        appBarBindings,
        channel,
        marketplaceListing,
        activePluginId,
    };
};

type Actions = {
    fetchListing: () => Promise<{ data?: Array<MarketplacePlugin | MarketplaceApp>}>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            fetchListing,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
