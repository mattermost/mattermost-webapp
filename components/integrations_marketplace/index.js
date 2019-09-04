// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMarketplacePlugins} from 'mattermost-redux/actions/plugins';
import {getMarketplaceInstalledPlugins} from 'mattermost-redux/selectors/entities/plugins';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';

import MarketplaceModal from './marketplace_modal.jsx';

function mapStateToProps(state) {
    return {
        show: isModalOpen(state, ModalIdentifiers.INTEGRATIONS_MARKETPLACE),
        installedPlugins: getMarketplaceInstalledPlugins(state),
        marketplacePlugins: state.entities.plugins.marketplacePlugins.data,
        serverError: state.entities.plugins.marketplacePlugins.serverError,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal: () => closeModal(ModalIdentifiers.INTEGRATIONS_MARKETPLACE),
            getMarketplacePlugins,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal);
