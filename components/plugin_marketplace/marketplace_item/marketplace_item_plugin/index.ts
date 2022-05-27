// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {getIntegrationsUsage} from 'mattermost-redux/selectors/entities/usage';
import {GenericAction} from 'mattermost-redux/types/actions';
import {disablePlugin, enablePlugin} from 'mattermost-redux/actions/admin';

import {GlobalState} from 'types/store';

import {installPlugin} from 'actions/marketplace';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getInstalling, getError} from 'selectors/views/marketplace';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import MarketplaceItemPlugin, {MarketplaceItemPluginProps} from './marketplace_item_plugin';

type Props = {
    id: string;
}

function mapStateToProps(state: GlobalState, props: Props) {
    const installing = getInstalling(state, props.id);
    const error = getError(state, props.id);
    const isDefaultMarketplace = getConfig(state).IsDefaultMarketplace === 'true';

    const pluginStatuses = state.entities.admin.pluginStatuses;
    const pluginStatus = pluginStatuses?.[props.id];

    const limits = getCloudLimits(state);
    const integrationsUsage = getIntegrationsUsage(state);

    return {
        installing,
        error,
        isDefaultMarketplace,
        trackEvent,
        pluginStatus,
        limits,
        integrationsUsage,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject, MarketplaceItemPluginProps['actions']>({
            installPlugin,
            enablePlugin,
            disablePlugin,
            closeMarketplaceModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceItemPlugin);
