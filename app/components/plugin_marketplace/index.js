// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getPlugins, getInstalledPlugins} from 'selectors/views/marketplace';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getSiteURL} from 'utils/url';

import {closeModal} from 'actions/views/modals';
import {fetchPlugins, filterPlugins} from 'actions/marketplace';

import {MarketplaceModal} from './marketplace_modal';

function mapStateToProps(state) {
    return {
        show: isModalOpen(state, ModalIdentifiers.PLUGIN_MARKETPLACE),
        plugins: getPlugins(state),
        installedPlugins: getInstalledPlugins(state),
        siteURL: getSiteURL(state),
        pluginStatuses: state.entities.admin.pluginStatuses,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
            fetchPlugins,
            filterPlugins,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal);
