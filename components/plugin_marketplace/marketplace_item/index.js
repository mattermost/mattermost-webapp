// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {installPlugin} from 'actions/marketplace';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getInstalling, getError} from 'selectors/views/marketplace';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import MarketplaceItem from './marketplace_item';

function mapStateToProps(state, props) {
    const installing = getInstalling(state, props.id);
    const error = getError(state, props.id);
    const isDefaultMarketplace = getConfig(state).IsDefaultMarketplace === 'true';

    return {
        installing,
        error,
        isDefaultMarketplace,
        trackEvent,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            installPlugin,
            closeMarketplaceModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceItem);
